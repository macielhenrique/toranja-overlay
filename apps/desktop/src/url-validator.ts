export interface UrlValidationResult {
  valid: boolean;
  normalizedUrl: string | null;
  sanitizedDisplay: string | null;
  host: string | null;
  reason: string | null;
}

const ALLOWED_ROOT_DOMAIN = "socialstream.ninja";
export const MAX_URL_LENGTH = 4096;

export function isAllowedSocialStreamHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (
    !normalized ||
    normalized.startsWith(".") ||
    normalized.endsWith(".") ||
    normalized.includes("..")
  ) {
    return false;
  }
  if (normalized === ALLOWED_ROOT_DOMAIN) {
    return true;
  }
  const suffix = `.${ALLOWED_ROOT_DOMAIN}`;
  if (!normalized.endsWith(suffix)) {
    return false;
  }
  const prefix = normalized.slice(0, -suffix.length);
  return (
    prefix.length > 0 &&
    prefix
      .split(".")
      .every(
        (label) =>
          label.length > 0 && !label.startsWith("-") && !label.endsWith("-")
      )
  );
}

/**
 * Validates that a candidate string is a strict HTTPS URL pointing to
 * socialstream.ninja (or an official subdomain), without embedded credentials
 * or non-standard ports, and produces a redacted display string that never
 * leaks session tokens from query parameters or hashes.
 */
export function validateSocialStreamUrl(rawInput: string): UrlValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "Informe a URL de overlay do Social Stream Ninja.",
    };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "A URL informada excede o limite máximo permitido.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "Formato de URL inválido. Exemplo: https://socialstream.ninja/dock.html",
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "Apenas conexões seguras HTTPS são permitidas.",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "Credenciais embutidas na URL não são permitidas.",
    };
  }

  if (parsed.port) {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host: null,
      reason: "Portas não padrão não são permitidas para o overlay.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (!isAllowedSocialStreamHost(host)) {
    return {
      valid: false,
      normalizedUrl: null,
      sanitizedDisplay: null,
      host,
      reason: "Host não autorizado. Use exclusivamente socialstream.ninja.",
    };
  }

  const safePath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/";
  const hasSecretParams = parsed.search.length > 0 || parsed.hash.length > 0;
  const sanitizedDisplay = hasSecretParams
    ? `https://${host}${safePath} [sessão ocultada]`
    : `https://${host}${safePath}`;

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    sanitizedDisplay,
    host,
    reason: null,
  };
}
