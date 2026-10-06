"use client";

import { Home, NotebookPen, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/routing";

const tabs = [
  { href: "/", key: "dashboard", icon: Home },
  { href: "/journal", key: "journal", icon: NotebookPen },
  { href: "/profile", key: "profile", icon: User },
] as const;

export default function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-md">
        {tabs.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
