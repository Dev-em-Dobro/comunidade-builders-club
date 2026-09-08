export function postTemLinkPublico(
  linkUrl: string | null | undefined,
  body: string,
): boolean {
  const link = linkUrl?.trim() ?? "";
  if (/^https:\/\//i.test(link) && !link.startsWith("builders-club:")) {
    return true;
  }
  return /https:\/\/[^\s)>\]]+/i.test(body);
}
