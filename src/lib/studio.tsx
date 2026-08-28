import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface TagDef {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
}

export interface DictEntry {
  id: string;
  term: string;
  replacement: string;
}

export interface Paragraph {
  id: string;
  original: string;
  translated: string;
  tagId: string;
}

export interface StudioPage {
  id: string;
  name: string;
  url: string;
  paragraphs: Paragraph[];
}

export const DEFAULT_TAGS: TagDef[] = [
  { id: "dialogue", name: "Dialogue", prefix: '"', suffix: '"' },
  { id: "thought", name: "Thought", prefix: "(", suffix: ")" },
  { id: "scream", name: "Scream", prefix: "<", suffix: ">" },
  { id: "system", name: "System", prefix: "[", suffix: "]" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

interface StudioContextValue {
  apiKey: string;
  setApiKey: (v: string) => void;
  tags: TagDef[];
  setTags: (t: TagDef[]) => void;
  addTag: (t: Omit<TagDef, "id">) => void;
  deleteTag: (id: string) => void;
  restoreDefaultTags: () => void;
  dictionary: DictEntry[];
  addEntry: (e: Omit<DictEntry, "id">) => void;
  deleteEntry: (id: string) => void;
  pages: StudioPage[];
  setPages: (p: StudioPage[]) => void;
  activePage: number;
  setActivePage: (i: number) => void;
  view: "upload" | "workspace";
  setView: (v: "upload" | "workspace") => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  updateParagraph: (pageId: string, paraId: string, patch: Partial<Paragraph>) => void;
  moveParagraph: (pageId: string, index: number, dir: -1 | 1) => void;
  replaceInPage: (pageIndex: number, search: string, replace: string) => number;
  replaceInAll: (search: string, replace: string) => number;
  newUid: () => string;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (v: T) => {
      setValue(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* ignore */
      }
    },
    [key],
  );
  return [value, set] as const;
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = usePersisted<string>("mts.apiKey", "");
  const [tags, setTags] = usePersisted<TagDef[]>("mts.tags", DEFAULT_TAGS);
  const [dictionary, setDictionary] = usePersisted<DictEntry[]>("mts.dict", []);
  const [pages, setPages] = useState<StudioPage[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [view, setView] = useState<"upload" | "workspace">("upload");
  const [targetLang, setTargetLang] = useState("ar");

  const value = useMemo<StudioContextValue>(
    () => ({
      apiKey,
      setApiKey,
      tags,
      setTags,
      addTag: (t) => setTags([...tags, { ...t, id: uid() }]),
      deleteTag: (id) => setTags(tags.filter((t) => t.id !== id)),
      restoreDefaultTags: () => setTags(DEFAULT_TAGS),
      dictionary,
      addEntry: (e) => setDictionary([...dictionary, { ...e, id: uid() }]),
      deleteEntry: (id) => setDictionary(dictionary.filter((e) => e.id !== id)),
      pages,
      setPages,
      activePage,
      setActivePage,
      view,
      setView,
      targetLang,
      setTargetLang,
      updateParagraph: (pageId, paraId, patch) =>
        setPages(
          pages.map((p) =>
            p.id !== pageId
              ? p
              : {
                  ...p,
                  paragraphs: p.paragraphs.map((par) =>
                    par.id === paraId ? { ...par, ...patch } : par,
                  ),
                },
          ),
        ),
      moveParagraph: (pageId, index, dir) =>
        setPages(
          pages.map((p) => {
            if (p.id !== pageId) return p;
            const next = [...p.paragraphs];
            const target = index + dir;
            if (target < 0 || target >= next.length) return p;
            const item = next[index];
            if (!item) return p;
            next.splice(index, 1);
            next.splice(target, 0, item);
            return { ...p, paragraphs: next };
          }),
        ),
      replaceInPage: (pageIndex, search, replace) => {
        if (!search) return 0;
        let count = 0;
        setPages(
          pages.map((p, i) => {
            if (i !== pageIndex) return p;
            return {
              ...p,
              paragraphs: p.paragraphs.map((par) => {
                const hits = par.translated.split(search).length - 1;
                count += hits;
                return hits
                  ? { ...par, translated: par.translated.split(search).join(replace) }
                  : par;
              }),
            };
          }),
        );
        return count;
      },
      replaceInAll: (search, replace) => {
        if (!search) return 0;
        let count = 0;
        setPages(
          pages.map((p) => ({
            ...p,
            paragraphs: p.paragraphs.map((par) => {
              const hits = par.translated.split(search).length - 1;
              count += hits;
              return hits
                ? { ...par, translated: par.translated.split(search).join(replace) }
                : par;
            }),
          })),
        );
        return count;
      },
      newUid: uid,
    }),
    [apiKey, setApiKey, tags, setTags, dictionary, setDictionary, pages, activePage, view, targetLang],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
