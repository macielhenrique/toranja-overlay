import { describe, expect, it } from "vitest";
import {
  isAllowedSocialStreamHost,
  MAX_URL_LENGTH,
  validateSocialStreamUrl,
} from "./url-validator";

describe("validateSocialStreamUrl", () => {
  it("accepts valid HTTPS socialstream.ninja dock URL and redacts session parameters", () => {
    const res = validateSocialStreamUrl(
      "https://socialstream.ninja/dock.html?session=TEST_PLACEHOLDER_TOKEN&compact"
    );
    expect(res.valid).toBe(true);
    expect(res.host).toBe("socialstream.ninja");
    expect(res.sanitizedDisplay).toBe(
      "https://socialstream.ninja/dock.html [sessão ocultada]"
    );
    expect(res.sanitizedDisplay).not.toContain("TEST_PLACEHOLDER_TOKEN");

    const localized = validateSocialStreamUrl(
      "https://socialstream.ninja/dock.html?session=TEST_PLACEHOLDER_TOKEN&ln=pt-br"
    );
    expect(localized.valid).toBe(true);
    expect(localized.sanitizedDisplay).toBe(
      "https://socialstream.ninja/dock.html [sessão ocultada]"
    );
  });

  it("redacts URL hash fragments as well", () => {
    const res = validateSocialStreamUrl(
      "https://socialstream.ninja/dock.html#secretFragment"
    );
    expect(res.valid).toBe(true);
    expect(res.sanitizedDisplay).toBe(
      "https://socialstream.ninja/dock.html [sessão ocultada]"
    );
    expect(res.sanitizedDisplay).not.toContain("secretFragment");
  });

  it("accepts official subdomains and normalized default HTTPS port 443", () => {
    const res = validateSocialStreamUrl(
      "https://beta.socialstream.ninja/featured.html"
    );
    expect(res.valid).toBe(true);
    expect(res.host).toBe("beta.socialstream.ninja");
    expect(res.sanitizedDisplay).toBe(
      "https://beta.socialstream.ninja/featured.html"
    );

    const defaultPort = validateSocialStreamUrl(
      "https://socialstream.ninja:443/dock.html"
    );
    expect(defaultPort.valid).toBe(true);
    expect(defaultPort.sanitizedDisplay).toBe(
      "https://socialstream.ninja/dock.html"
    );
  });

  it("rejects insecure HTTP URLs", () => {
    const res = validateSocialStreamUrl(
      "http://socialstream.ninja/dock.html"
    );
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("HTTPS");
  });

  it("rejects unauthorized hosts, lookalike domains and malformed dots", () => {
    expect(isAllowedSocialStreamHost("evil-socialstream.ninja")).toBe(false);
    expect(isAllowedSocialStreamHost("socialstream.ninja.evil.com")).toBe(false);
    expect(isAllowedSocialStreamHost(".socialstream.ninja")).toBe(false);
    expect(isAllowedSocialStreamHost("a..socialstream.ninja")).toBe(false);
    expect(isAllowedSocialStreamHost("socialstream.ninja.")).toBe(false);
    const res = validateSocialStreamUrl("https://example.com/dock.html");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Host não autorizado");
  });

  it("rejects javascript: and data: URIs", () => {
    expect(validateSocialStreamUrl("javascript:alert(1)").valid).toBe(false);
    expect(validateSocialStreamUrl("data:text/html,<h1>Hi</h1>").valid).toBe(false);
  });

  it("rejects embedded credentials, custom ports, empty and oversized URLs", () => {
    expect(
      validateSocialStreamUrl("https://user:pass@socialstream.ninja/dock.html")
        .valid
    ).toBe(false);
    expect(
      validateSocialStreamUrl("https://socialstream.ninja:8443/dock.html").valid
    ).toBe(false);
    expect(validateSocialStreamUrl("   ").valid).toBe(false);
    const oversized = `https://socialstream.ninja/dock.html?session=${"a".repeat(MAX_URL_LENGTH)}`;
    expect(validateSocialStreamUrl(oversized).valid).toBe(false);
  });
});
