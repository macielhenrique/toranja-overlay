use url::Url;

pub const ALLOWED_ROOT_DOMAIN: &str = "socialstream.ninja";
pub const MAX_URL_LENGTH: usize = 4096;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidatedOverlayUrl {
    pub url: Url,
    pub sanitized_display: String,
}

/// Checks whether `host` belongs strictly to `socialstream.ninja` or an official subdomain.
pub fn is_allowed_social_stream_host(host: &str) -> bool {
    let normalized = host.trim().to_ascii_lowercase();
    if normalized.is_empty()
        || normalized.starts_with('.')
        || normalized.ends_with('.')
        || normalized.contains("..")
    {
        return false;
    }

    if normalized == ALLOWED_ROOT_DOMAIN {
        return true;
    }

    let suffix = format!(".{ALLOWED_ROOT_DOMAIN}");
    if let Some(prefix) = normalized.strip_suffix(&suffix) {
        return !prefix.is_empty()
            && prefix
                .split('.')
                .all(|label| !label.is_empty() && !label.starts_with('-') && !label.ends_with('-'));
    }

    false
}

/// Builds a redacted display URL that never exposes query parameters or URL fragments.
pub fn sanitize_url_for_display(parsed: &Url) -> String {
    let host = parsed.host_str().unwrap_or_default().to_ascii_lowercase();
    let path = if parsed.path().is_empty() {
        "/"
    } else {
        parsed.path()
    };

    if parsed.query().is_some() || parsed.fragment().is_some() {
        format!("https://{host}{path} [sessão ocultada]")
    } else {
        format!("https://{host}{path}")
    }
}

/// Validates an external overlay URL against strict HTTPS + official host policy.
/// Error messages intentionally never echo the raw input or query/fragment values.
pub fn validate_overlay_url(raw: &str) -> Result<ValidatedOverlayUrl, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Informe a URL de overlay do Social Stream Ninja.".to_string());
    }

    if trimmed.len() > MAX_URL_LENGTH {
        return Err("A URL informada excede o limite máximo permitido.".to_string());
    }

    let parsed = Url::parse(trimmed).map_err(|_| {
        "Formato de URL inválido. Exemplo: https://socialstream.ninja/dock.html".to_string()
    })?;

    if parsed.scheme() != "https" {
        return Err("Apenas conexões seguras HTTPS são permitidas.".to_string());
    }

    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err("Credenciais embutidas na URL não são permitidas.".to_string());
    }

    if parsed.port().is_some() {
        return Err("Portas não padrão não são permitidas para o overlay.".to_string());
    }

    let host = parsed
        .host_str()
        .ok_or_else(|| "Host inválido na URL informada.".to_string())?;

    if !is_allowed_social_stream_host(host) {
        return Err("Host não autorizado. Use exclusivamente socialstream.ninja.".to_string());
    }

    let sanitized_display = sanitize_url_for_display(&parsed);
    Ok(ValidatedOverlayUrl {
        url: parsed,
        sanitized_display,
    })
}

/// Checks whether a URL belongs to the local Tauri controller origin.
pub fn is_controller_origin(url: &Url) -> bool {
    let scheme = url.scheme();
    let host = url.host_str();

    if scheme == "tauri" {
        return host == Some("localhost");
    }

    if (scheme == "http" || scheme == "https") && host == Some("tauri.localhost") {
        return true;
    }

    if cfg!(debug_assertions)
        && scheme == "http"
        && matches!(host, Some("localhost") | Some("127.0.0.1"))
        && url.port() == Some(1420)
    {
        return true;
    }

    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_valid_dock_url_and_redacts_query_params() {
        let res = validate_overlay_url(
            "https://socialstream.ninja/dock.html?session=TEST_PLACEHOLDER_TOKEN&compact",
        )
        .expect("should accept valid dock URL");

        assert_eq!(
            res.sanitized_display,
            "https://socialstream.ninja/dock.html [sessão ocultada]"
        );
        assert!(!res.sanitized_display.contains("TEST_PLACEHOLDER_TOKEN"));
    }

    #[test]
    fn accepts_valid_url_with_fragment_and_redacts_it() {
        let res = validate_overlay_url("https://socialstream.ninja/dock.html#secretFragment")
            .expect("should accept valid URL with fragment");

        assert_eq!(
            res.sanitized_display,
            "https://socialstream.ninja/dock.html [sessão ocultada]"
        );
        assert!(!res.sanitized_display.contains("secretFragment"));
    }

    #[test]
    fn accepts_official_subdomain_and_default_https_port() {
        let sub = validate_overlay_url("https://beta.socialstream.ninja/featured.html")
            .expect("should accept official subdomain");
        assert_eq!(
            sub.sanitized_display,
            "https://beta.socialstream.ninja/featured.html"
        );

        let default_port = validate_overlay_url("https://socialstream.ninja:443/dock.html")
            .expect("url crate normalizes default HTTPS port 443");
        assert_eq!(
            default_port.sanitized_display,
            "https://socialstream.ninja/dock.html"
        );
    }

    #[test]
    fn rejects_insecure_http_and_non_http_schemes() {
        assert!(validate_overlay_url("http://socialstream.ninja/dock.html").is_err());
        assert!(validate_overlay_url("javascript:alert(1)").is_err());
        assert!(validate_overlay_url("data:text/html,<h1>Hi</h1>").is_err());
        assert!(validate_overlay_url("file:///C:/Windows/win.ini").is_err());
    }

    #[test]
    fn rejects_lookalike_and_malformed_hosts() {
        for bad_host in [
            "evil-socialstream.ninja",
            "socialstream.ninja.evil.com",
            ".socialstream.ninja",
            "a..socialstream.ninja",
            "socialstream.ninja.",
            "example.com",
            "127.0.0.1",
            "[::1]",
            "",
        ] {
            assert!(
                !is_allowed_social_stream_host(bad_host),
                "expected host {bad_host:?} to be rejected"
            );
        }

        assert!(validate_overlay_url("https://socialstream.ninja.evil.com/dock.html").is_err());
        assert!(validate_overlay_url("https://a..socialstream.ninja/dock.html").is_err());
    }

    #[test]
    fn rejects_embedded_credentials_custom_ports_empty_and_oversized_urls() {
        assert!(validate_overlay_url("https://user:pass@socialstream.ninja/dock.html").is_err());
        assert!(validate_overlay_url("https://socialstream.ninja:8443/dock.html").is_err());
        assert!(validate_overlay_url("   ").is_err());

        let oversized = format!(
            "https://socialstream.ninja/dock.html?session={}",
            "a".repeat(MAX_URL_LENGTH)
        );
        assert!(validate_overlay_url(&oversized).is_err());
    }

    #[test]
    fn checks_controller_origins_strictly() {
        assert!(is_controller_origin(
            &Url::parse("http://tauri.localhost/index.html").unwrap()
        ));
        assert!(is_controller_origin(
            &Url::parse("https://tauri.localhost/index.html").unwrap()
        ));
        assert!(is_controller_origin(
            &Url::parse("tauri://localhost/index.html").unwrap()
        ));
        assert!(!is_controller_origin(
            &Url::parse("https://socialstream.ninja/dock.html").unwrap()
        ));
        assert!(!is_controller_origin(
            &Url::parse("http://example.com/").unwrap()
        ));
        assert!(!is_controller_origin(
            &Url::parse("http://localhost:3000/").unwrap()
        ));
    }
}
