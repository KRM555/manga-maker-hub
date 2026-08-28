import type { DictEntry, TagDef } from "@/lib/studio";

const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export interface ExtractedChunk {
  original: string;
  translated: string;
  tag: string;
  topPercent?: number;
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
    .map((t) => `${t.id} (${t.name}) (Prefix: ${t.prefix}, Suffix: ${t.suffix})`)
    .join("\n");
  const dict = opts.dictionary.length
    ? opts.dictionary.map((d) => `- "${d.term}" => "${d.replacement}"`).join("\n")
    : "(none)";

  return `Analyze the provided manga/webtoon image top-to-bottom:

1. Extract all original text blocks in reading order
   (right-to-left for Japanese manga, top-to-bottom for Korean webtoons).
2. Estimate "topPercent" (0 to 100) — the vertical location of the block on the page,
   where 0 is the very top of the image and 100 is the very bottom.
3. Visually and contextually analyze each text bubble/block and automatically classify it
   into the most accurate "category" from this list:
   ${tagList}
   Choose the category that best matches the block's visual style and context
   (e.g. a speech bubble is dialogue, a cloud-shaped bubble is thought, a jagged burst is
   scream, a rectangular UI-like box is system, a phone-screen bubble is phone, a
   floating caption box is narrator, onomatopoeia drawn in the art is sfx, small faint
   text in a bubble is whisper).
4. Translate each text block into ${opts.targetLanguage}.
5. Adhere strictly to the glossary's terminology and naming conventions:
   ${dict}

Rules:
- ${opts.extractSfx ? "Include sound effects (SFX)." : "Skip sound effects (SFX)."}
- ${opts.detectVertical ? "Detect and correctly order vertical text." : "Assume horizontal text."}
- Keep the "original" field as the raw source text exactly as it appears.
- Do not add the tag characters to the text itself; only return the category id.

Return ONLY valid JSON with this shape:
{"chunks":[{"original":"...","translated":"...","category":"<category id>","topPercent":<0-100>}]}`;
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
  let parsed: {
    chunks?: {
      original?: string;
      translated?: string;
      category?: string;
      tag?: string;
      topPercent?: number;
    }[];
  };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned an unexpected response format");
  }
  return (Array.isArray(parsed.chunks) ? parsed.chunks : []).map((c) => ({
    original: c.original ?? "",
    translated: c.translated ?? "",
    tag: c.category ?? c.tag ?? "",
    topPercent:
      typeof c.topPercent === "number" && Number.isFinite(c.topPercent)
        ? Math.min(100, Math.max(0, c.topPercent))
        : undefined,
  }));
}
