// These reviewed assets contain predominantly white artwork with transparent
// backgrounds. Keep the presentation decision separate from the artwork and
// catalog data: a neutral dark chip makes the original marks legible in both
// themes without changing the treatment of dark or coloured logos.
const LOGOS_REQUIRING_DARK_CHIP = new Set([
  "anytype",
  "authentik",
  "deltamaster",
  "fountain",
  "jitsi",
  "jolla-phone",
  "mangopay",
  "mapy-com",
  "opendesk",
  "opentalk",
  "papra",
  "penneo",
  "penpot",
  "posteo",
  "qwant",
  "safing-portmaster",
  "shift-phone",
  "stability-ai",
  "strato-mail",
  "tauschebanner",
  "wero",
]);

export function logoNeedsDarkChip(alternativeId: string): boolean {
  return LOGOS_REQUIRING_DARK_CHIP.has(alternativeId);
}
