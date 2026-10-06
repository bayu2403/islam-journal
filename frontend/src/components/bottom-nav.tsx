"use client";

import { NotebookPen, Orbit, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../i18n/routing";
import { useGlide } from "@/components/falak/use-glide";

const tabs = [
  { href: "/", key: "dashboard", icon: Orbit },
  { href: "/journal", key: "journal", icon: NotebookPen },
  { href: "/profile", key: "profile", icon: User },
] as const;

export default function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const ref = useGlide<HTMLElement>(pathname);

  return (
    <div className="sticky bottom-0 z-40 pt-2">
      <nav ref={ref} className="fk-dock" aria-label={t("main")}>
        <span className="ind" aria-hidden="true" />
        {tabs.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={key} href={href} aria-current={active ? "page" : undefined}>
              <Icon className="fk-i" strokeWidth={active ? 2.1 : 1.6} />
              {t(key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
