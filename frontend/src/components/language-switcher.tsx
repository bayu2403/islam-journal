"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../../i18n/routing";
import { useTransition } from "react";

const localeNames: Record<string, string> = {
  id: "Indonesia",
  en: "English",
  ms: "Melayu",
};

export default function LanguageSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="relative group">
      <button
        className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        disabled={isPending}
      >
        <span className="text-base">{locale === "id" ? "🇮🇩" : locale === "en" ? "🇬🇧" : "🇲🇾"}</span>
        <span>{t(locale)}</span>
        <svg
          className="h-3.5 w-3.5 opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="absolute right-0 mt-1 w-40 origin-top-right rounded-md border bg-popover p-1 opacity-0 shadow-md transition-all invisible group-hover:visible group-hover:opacity-100">
        {Object.keys(localeNames).map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors ${
              loc === locale
                ? "bg-accent text-accent-foreground font-medium"
                : "text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <span>{loc === "id" ? "🇮🇩" : loc === "en" ? "🇬🇧" : "🇲🇾"}</span>
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
