export async function getDeviceFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
    navigator.platform,
  ];
  const str = parts.join("|");
  const encoded = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "fp-" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export function guessDeviceType(): "pc" | "phone" | "tablet" {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "phone";
  return "pc";
}
