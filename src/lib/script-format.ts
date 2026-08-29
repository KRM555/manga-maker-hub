import type { StudioPage, TagDef } from "@/lib/studio";

export function tagSymbol(tag: TagDef): string {
  return `${tag.prefix}${tag.suffix}`;
}

export function buildLegend(tags: TagDef[]): string {
  const lines = tags
    .filter((tag) => tag.prefix || tag.suffix)
    .map((tag) => `${tagSymbol(tag)}: ${tag.name}`);
  return lines.length > 0 ? `--- Legend ---\n${lines.join("\n")}\n\n` : "";
}

function lineForParagraph(
  text: string,
  tagId: string,
  tags: TagDef[],
): string {
  const tag = tags.find((t) => t.id === tagId);
  const symbol = tag ? tagSymbol(tag) : "";
  return `${symbol}: ${text}`;
}

export function formatPageScript(
  page: StudioPage,
  pageNumber: number,
  tags: TagDef[],
  field: "original" | "translated" = "translated",
): string {
  const banner = `=== Page ${pageNumber}: ${page.name} ===`;
  const body = page.paragraphs
    .map((par) => lineForParagraph(par[field] ?? "", par.tagId, tags))
    .join("\n");
  return `${banner}\n${body}`;
}

export function formatFullScript(
  pages: StudioPage[],
  tags: TagDef[],
  field: "original" | "translated" = "translated",
): string {
  const legend = buildLegend(tags);
  const pagesText = pages
    .map((p, i) => formatPageScript(p, i + 1, tags, field))
    .join("\n\n");
  return `${legend}${pagesText}`;
}
