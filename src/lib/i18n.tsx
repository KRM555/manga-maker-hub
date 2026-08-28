import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ar";

const translations = {
  en: {
    appName: "Manhwa Transtool Studio",
    appTagline: "AI-powered translation workspace for manga & manhwa teams",
    language: "Language",
    themeToggle: "Toggle theme",
    loginRegister: "Login / Register",
    newProject: "New Project",
    dictionary: "Dictionary",
    tagsSettings: "Tags Settings",
    geminiApiKey: "Gemini API Key",
    geminiApiKeyPlaceholder: "Paste your Gemini API key…",
    tooltipDictionary: "Save character names to maintain consistent translation",
    tooltipTags: "Customize formatting for dialogue, thoughts, shouts, etc.",
    tooltipApiKey: "Enter your Google Gemini API key to enable AI translation",
    tooltipGetApiKey: "Get Gemini API Key",
    tooltipNewProject: "Start a fresh translation project",
    tooltipLogin: "Sign in to sync your projects and settings",
    howItWorks: "How it works",
    howItWorksSub: "From raw pages to a finished chapter in three steps",
    step1Title: "Set up your tools",
    step1Desc:
      "Enter your API key and customize your tags & dictionary for consistent results.",
    step2Title: "Upload your pages",
    step2Desc:
      "Drop manga pages as images or a ZIP archive — we handle the rest.",
    step3Title: "Extract, translate, export",
    step3Desc:
      "Extract text, review the results, translate with AI, and export your chapter.",
    uploadTitle: "Upload Manga Pages",
    uploadDesc: "Drag & drop your pages here, or click to browse",
    uploadFormats: "Supports ZIP, PNG, JPG, WEBP",
    filesSelected: "file(s) selected",
    settingsTitle: "Extraction & Translation Settings",
    settingsDesc: "Configure how text is detected and translated",
    targetLanguage: "Target Language",
    targetLanguagePlaceholder: "Select target language",
    langArabic: "Arabic",
    langEnglish: "English",
    langJapanese: "Japanese",
    langKorean: "Korean",
    extractSfx: "Extract SFX (Sound Effects)",
    detectVertical: "Detect Vertical Text automatically",
    analyze: "Analyze and Extract Texts",
    filesReady: "file(s) ready",
    clearFiles: "Clear",
  },
  ar: {
    appName: "استوديو ترجمة المانهوا",
    appTagline: "مساحة عمل ذكية لفرق ترجمة المانجا والمانهوا",
    language: "اللغة",
    themeToggle: "تبديل المظهر",
    loginRegister: "تسجيل الدخول / إنشاء حساب",
    newProject: "مشروع جديد",
    dictionary: "القاموس",
    tagsSettings: "إعدادات الوسوم",
    geminiApiKey: "مفتاح Gemini API",
    geminiApiKeyPlaceholder: "الصق مفتاح Gemini API هنا…",
    tooltipDictionary: "احفظ أسماء الشخصيات للحفاظ على ترجمة متسقة",
    tooltipTags: "خصّص تنسيق الحوار والأفكار والصرخات وغيرها",
    tooltipApiKey: "أدخل مفتاح Google Gemini API لتفعيل الترجمة بالذكاء الاصطناعي",
    tooltipGetApiKey: "احصل على مفتاح Gemini API",
    tooltipNewProject: "ابدأ مشروع ترجمة جديداً",
    tooltipLogin: "سجّل الدخول لمزامنة مشاريعك وإعداداتك",
    howItWorks: "كيف يعمل",
    howItWorksSub: "من الصفحات الخام إلى فصل جاهز في ثلاث خطوات",
    step1Title: "جهّز أدواتك",
    step1Desc: "أدخل مفتاح API وخصّص الوسوم والقاموس لنتائج متسقة.",
    step2Title: "ارفع صفحاتك",
    step2Desc: "أفلت صفحات المانجا كصور أو ملف ZIP — ونتولى نحن الباقي.",
    step3Title: "استخرج، ترجم، صدّر",
    step3Desc: "استخرج النصوص، راجع النتائج، ترجم بالذكاء الاصطناعي وصدّر فصلك.",
    uploadTitle: "ارفع صفحات المانجا",
    uploadDesc: "اسحب صفحاتك وأفلتها هنا، أو انقر للتصفح",
    uploadFormats: "يدعم ZIP و PNG و JPG و WEBP",
    filesSelected: "ملف محدد",
    settingsTitle: "إعدادات الاستخراج والترجمة",
    settingsDesc: "تحكم في طريقة اكتشاف النصوص وترجمتها",
    targetLanguage: "اللغة المستهدفة",
    targetLanguagePlaceholder: "اختر اللغة المستهدفة",
    langArabic: "العربية",
    langEnglish: "الإنجليزية",
    langJapanese: "اليابانية",
    langKorean: "الكورية",
    extractSfx: "استخراج المؤثرات الصوتية (SFX)",
    detectVertical: "اكتشاف النص العمودي تلقائياً",
    analyze: "تحليل واستخراج النصوص",
    filesReady: "ملف جاهز",
    clearFiles: "مسح",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? key,
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
