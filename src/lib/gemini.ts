import type { DictEntry, TagDef } from "@/lib/studio";

const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export interface ExtractedChunk {
  original: string;
  translated: string;
  tag: string;
}

export function fileToBase64(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = String(reader.result);
      const meta = result.split(",")[0] ?? "";
      const data = result.split(",")[1] ?? "";
      const mimeType = meta.slice(5).split(";")[0] || file.type || "image/png";
      resolve({ mimeType, data });
    };
    reader.readAsDataURL(file);
  });
}

function buildPrompt(opts: {
  tags: TagDef[];
  dictionary: DictEntry[];
  targetLanguage: string;
  extractSfx: boolean;
  detectVertical: boolean;
}) {
  const tagList = opts.tags
    .map((t) => `- id "${t.id}" (${t.name}): wraps text as ${t.prefix}text${t.suffix}`)
    .join("\n");
  const dict = opts.dictionary.length
    ? opts.dictionary.map((d) => `- "${d.term}" => "${d.replacement}"`).join("\n")
    : "(none)";

  return `You are a professional manga/manhwa translator and OCR engine.

Task: read the provided comic page image, extract every text chunk in natural reading order
(right-to-left for Japanese manga, top-to-bottom for Korean webtoons), then translate each chunk
into ${opts.targetLanguage}.

Available formatting tags (choose the most contextually appropriate one per chunk):
${tagList}

Glossary — these replacements are mandatory in the translation:
${dict}

Rules:
- ${opts.extractSfx ? "Include sound effects (SFX)." : "Skip sound effects (SFX)."}
- ${opts.detectVertical ? "Detect and correctly order vertical text." : "Assume horizontal text."}
- Keep the "original" field as the raw source text exactly as it appears.
- Do not add the tag characters to the text itself; only return the tag id.

Return ONLY valid JSON with this shape:
{"chunks":[{"original":"...","translated":"...","tag":"<tag id>"}]}`;
}

export async function extractPage(opts: {
  apiKey: string;
  file: File;
  tags: TagDef[];
  dictionary: DictEntry[];
  targetLanguage: string;
  extractSfx: boolean;
  detectVertical: boolean;
}): Promise<ExtractedChunk[]> {
  const { mimeType, data } = await fileToBase64(opts.file);

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(opts.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(opts) }, { inlineData: { mimeType, data } }],
        },
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    }),
  });

  if (!res.ok) {
    let message = `Gemini request failed (${res.status})`;
    try {
      const err = await res.json();
      message = err?.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const json = await res.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
    "";

  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: { chunks?: ExtractedChunk[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned an unexpected response format");
  }
  return Array.isArray(parsed.chunks) ? parsed.chunks : [];
}
