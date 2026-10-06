"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Camera, CloudOff, Monitor, Moon, Sun, User } from "lucide-react";
import { usePathname, useRouter } from "../../../../../i18n/routing";
import { api, invalidate } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useTheme, type Gender, type ThemeMode } from "@/components/theme-provider";
import StoryCard from "@/components/story-card";
import ActivityFeed from "@/components/activity-feed";
import Segmented from "@/components/falak/segmented";
import { Input } from "@/components/ui/input";

type Profile = {
  display_name: string | null;
  gender: Gender;
  theme_mode: ThemeMode;
  locale: string;
  city: string | null;
  country: string | null;
};

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const nav = useTranslations("Nav");
  const dash = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { session, isGuest } = useAuth();
  const { gender, mode, setGender, setMode } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    api<Profile>("/profile").then((p) => {
      setProfile(p);
      setName(p.display_name ?? "");
      setCity(p.city ?? "");
      setCountry(p.country ?? "");
    }).catch(() => {});
  }, [session]);

  async function save(patch: Partial<Profile>) {
    await api("/profile", { method: "PATCH", body: JSON.stringify(patch) });
    invalidate("GET:/profile");
  }

  function pickGender(g: Gender) {
    setGender(g);           // instant theme switch
    save({ gender: g });    // persist
  }

  function pickMode(m: ThemeMode) {
    setMode(m);
    save({ theme_mode: m });
  }

  function pickLocale(l: string) {
    save({ locale: l });
    router.replace(pathname, { locale: l });
  }

  async function linkEmail() {
    setAuthMsg("");
    const { error } = await supabase.auth.updateUser({ email, password });
    setAuthMsg(error ? error.message : t("saved"));
  }

  async function linkGoogle() {
    await supabase.auth.linkIdentity({ provider: "google" });
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload(); // AuthProvider re-runs → fresh anonymous session
  }

  const shownName = profile?.display_name || dash("guestName");

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-9 pb-6">
      <h1 className="fk-display fk-enter" style={enter(0)}>{t("title")}</h1>

      {/* Identity: avatar with orbiting ring + camera badge + name */}
      <div className="fk-enter flex items-center gap-4" style={enter(1)}>
        <div className="fk-avatar">
          {profile?.display_name ? profile.display_name[0].toUpperCase() : <User className="fk-i lg" />}
          <span className="cam">
            <Camera className="fk-i sm" />
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="fk-h1 truncate">{shownName}</p>
          <span className="fk-hud fk-muted">{isGuest ? t("guest") : profile?.city || " "}</span>
        </div>
      </div>

      <div className="fk-enter" style={enter(2)}>
        <StoryCard />
      </div>

      <section className="fk-sect fk-enter" style={enter(3)}>
        <h2 className="fk-h2">{t("myActivity")}</h2>
        <ActivityFeed name={shownName} />
      </section>

      {isGuest && (
        <section className="fk-glass fk-enter flex flex-col gap-3" style={{ ...enter(4), borderColor: "var(--accent)" }}>
          <div className="fk-note">
            <CloudOff className="fk-i ic" />
            <p className="fk-small m-0">{t("guestBanner")}</p>
          </div>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="fk-btn fk-btn-primary" onClick={linkEmail} disabled={!email || password.length < 6}>
              {t("saveAccount")}
            </button>
            {GOOGLE_ENABLED && (
              <button type="button" className="fk-btn fk-btn-outline" onClick={linkGoogle}>{t("continueGoogle")}</button>
            )}
          </div>
          {authMsg && <p className="fk-help m-0" role="status">{authMsg}</p>}
        </section>
      )}

      <section className="fk-glass fk-enter flex flex-col gap-5" style={enter(5)}>
        <div className="fk-field">
          <span className="fk-label">{t("name")}</span>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-label={t("name")} />
            <button
              type="button"
              className="fk-btn fk-btn-primary"
              style={{ height: 46 }}
              onClick={() =>
                save({ display_name: name }).then(() =>
                  setProfile((p) => (p ? { ...p, display_name: name } : p)),
                )
              }
            >
              {t("save")}
            </button>
          </div>
        </div>
        <hr className="fk-sep" />
        <div className="fk-field">
          <span className="fk-label">{t("gender")}</span>
          <Segmented<Gender>
            full
            label={t("gender")}
            value={gender}
            onChange={pickGender}
            options={[
              { value: "ikhwan", label: t("ikhwan") },
              { value: "akhwat", label: t("akhwat") },
            ]}
          />
        </div>
        <div className="fk-field">
          <span className="fk-label">{t("darkMode")}</span>
          <Segmented<ThemeMode>
            full
            label={t("darkMode")}
            value={mode}
            onChange={pickMode}
            options={[
              { value: "light", label: <><Sun className="fk-i sm" />{t("light")}</> },
              { value: "dark", label: <><Moon className="fk-i sm" />{t("dark")}</> },
              { value: "system", label: <><Monitor className="fk-i sm" />{t("system")}</> },
            ]}
          />
        </div>
        <div className="fk-field">
          <span className="fk-label">{t("language")}</span>
          <Segmented<string>
            full
            label={t("language")}
            value={locale}
            onChange={pickLocale}
            options={(["id", "en", "ms"] as const).map((l) => ({ value: l, label: nav(l) }))}
          />
        </div>
        <hr className="fk-sep" />
        <div className="fk-field">
          <span className="fk-label">{t("city")}</span>
          <div className="flex gap-2">
            <Input value={city} onChange={(e) => setCity(e.target.value)} aria-label={t("city")} />
            <button type="button" className="fk-btn fk-btn-outline" style={{ height: 46 }} onClick={() => save({ city })}>
              {t("save")}
            </button>
          </div>
        </div>
        <div className="fk-field">
          <span className="fk-label">{t("country")}</span>
          <div className="flex gap-2">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t("country")} />
            <button type="button" className="fk-btn fk-btn-outline" style={{ height: 46 }} onClick={() => save({ country })}>
              {t("save")}
            </button>
          </div>
        </div>
      </section>

      {!isGuest && (
        <button type="button" className="fk-btn fk-btn-outline" onClick={logout}>{t("logout")}</button>
      )}
    </div>
  );
}
