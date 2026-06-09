import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const current = i18n.language?.startsWith("uk") ? "uk" : "en";

    return (
        <div className="flex items-center gap-1 rounded-md border border-gray-200 p-0.5">
            {(["uk", "en"] as const).map((lang) => (
                <button
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                        current === lang
                            ? "bg-brand-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    {lang === "uk" ? "УКР" : "ENG"}
                </button>
            ))}
        </div>
    );
}
