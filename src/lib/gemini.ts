import type { DictEntry, TagDef } from "@/lib/studio";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface ExtractedChunk {
  original: string;
  translated: string;
  tag: string;
  topPercent?: number | undefined;
}

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
};

function detectMime(file: File): string {
  const ext = Object.entries(EXT_TO_MIME).find(([ext]) =>
    file.name.toLowerCase().endsWith(ext),
  );
  if (ext) return ext[1];
  if (file.type && file.type.startsWith("image/")) return file.type;
  return "image/png";
}

export function fileToBase64(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIdx = result.indexOf(",");
      const data = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;

      if (!data) {
        reject(new Error(`No base64 data extracted from: ${file.name}`));
        return;
      }

      const mimeType = detectMime(file);
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

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly isAuthError?: boolean,
    readonly isQuotaError?: boolean,
  ) {
    super(message);
    this.name = "GeminiError";
  }
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

  console.log(`[Gemini] Sending ${opts.file.name} (${mimeType}, ${data.length} base64 chars) to ${MODEL}`);

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(opts) },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
  };

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(opts.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch (networkErr) {
    throw new GeminiError(
      `Network error contacting Gemini: ${networkErr instanceof Error ? networkErr.message : "unknown"}`,
    );
  }

  if (!res.ok) {
    let message = `Gemini request failed (${res.status})`;
    let isAuth = false;
    let isQuota = false;
    try {
      const err = await res.json();
      const apiMsg = err?.error?.message ?? "";
      if (apiMsg) message = `${message}: ${apiMsg}`;
      if (res.status === 400 && /api key/i.test(apiMsg)) isAuth = true;
      if (res.status === 401 || res.status === 403) isAuth = true;
      if (res.status === 429 || /quota|rate/i.test(apiMsg)) isQuota = true;
    } catch {
      /* response body wasn't JSON — keep the status-only message */
    }
    throw new GeminiError(message, res.status, isAuth, isQuota);
  }

  const json = await res.json();

  console.log("[Gemini] Raw response JSON:", JSON.stringify(json).slice(0, 2000));

  const candidate = json?.candidates?.[0];
  if (!candidate) {
    const blockReason = json?.promptFeedback?.blockReason;
    throw new GeminiError(
      blockReason
        ? `Gemini blocked the request: ${blockReason}`
        : "Gemini returned no candidates (the model produced no output). Check your API key and quota.",
    );
  }

  const finishReason = candidate.finishReason;
  if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
    console.warn(`[Gemini] Non-normal finishReason: ${finishReason}`);
  }

  const text: string =
    candidate.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";

  console.log(`[Gemini] Extracted text length: ${text.length} chars`);

  if (!text.trim()) {
    throw new GeminiError(
      `Gemini returned an empty response for "${opts.file.name}". The model may have been unable to read the image.`,
    );
  }

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

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
    console.error("[Gemini] Failed to parse cleaned text:", cleaned.slice(0, 500));
    throw new GeminiError(
      `Gemini returned an unparseable response for "${opts.file.name}". Check the console for details.`,
    );
  }

  if (!Array.isArray(parsed.chunks)) {
    console.error("[Gemini] Response had no 'chunks' array:", JSON.stringify(parsed).slice(0, 500));
    throw new GeminiError(
      `Gemini response for "${opts.file.name}" was valid JSON but contained no "chunks" array.`,
    );
  }

  if (parsed.chunks.length === 0) {
    throw new GeminiError(
      `Gemini found no text blocks in "${opts.file.name}". The image may not contain readable text, or the model could not process it.`,
    );
  }

  return parsed.chunks.map((c) => ({
    original: c.original ?? "",
    translated: c.translated ?? "",
    tag: c.category ?? c.tag ?? "",
    topPercent:
      typeof c.topPercent === "number" && Number.isFinite(c.topPercent)
        ? Math.min(100, Math.max(0, c.topPercent))
        : undefined,
  }));
}
