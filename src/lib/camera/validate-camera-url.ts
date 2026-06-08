export type ValidateCameraUrlResult =
  | { ok: true; href: string; isHls: boolean }
  | {
      ok: false;
      reason: "empty" | "parse_error" | "unsafe_scheme" | "mixed_content";
      message: string;
    };

const UNSAFE_PROTOCOLS = new Set(["javascript:", "vbscript:", "data:"]);

export function looksLikeHlsUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return u.pathname.toLowerCase().includes(".m3u8");
  } catch {
    return false;
  }
}

/**
 * Validates a user-supplied URL for use as <img src> or HLS <video> source.
 * @param pageIsHttps - true when `window.location.protocol === 'https:'` (mixed content guard).
 */
export function validateCameraPreviewUrl(
  raw: string,
  options: { pageIsHttps: boolean },
): ValidateCameraUrlResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty", message: "Informe uma URL." };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: "parse_error", message: "URL inválida." };
  }

  const protocol = url.protocol.toLowerCase();
  if (UNSAFE_PROTOCOLS.has(protocol)) {
    return {
      ok: false,
      reason: "unsafe_scheme",
      message: "Esquema não permitido.",
    };
  }
  if (protocol !== "http:" && protocol !== "https:") {
    return {
      ok: false,
      reason: "unsafe_scheme",
      message: "Use apenas http:// ou https://.",
    };
  }
  if (options.pageIsHttps && protocol === "http:") {
    return {
      ok: false,
      reason: "mixed_content",
      message:
        "Conteúdo misto: em HTTPS não é possível carregar um stream HTTP. Use uma URL https:// ou acesse o painel em http em desenvolvimento.",
    };
  }

  const href = url.toString();
  return { ok: true, href, isHls: looksLikeHlsUrl(href) };
}

/** Strips embedded credentials for display (never log raw URLs with passwords). */
export function redactUrlForDisplay(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.username = "";
    u.password = "";
    return u.toString();
  } catch {
    return "***";
  }
}
