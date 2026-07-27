export function buildBrowseSearchPath(
  language: string,
  rawQuery: string,
): string {
  const browsePath = `/${language}/browse`;
  const query = rawQuery.trim();

  if (!query) {
    return browsePath;
  }

  const searchParams = new URLSearchParams({ q: query });
  return `${browsePath}?${searchParams.toString()}`;
}
