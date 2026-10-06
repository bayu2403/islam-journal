"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Camera, User } from "lucide-react";
import { usePathname, useRouter } from "../../../../i18n/routing";
import { api, invalidate } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useTheme, type Gender, type ThemeMode } from "@/components/theme-provider";
import StoryCard from "@/components/story-card";
import ActivityFeed from "@/components/activity-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Profile = {
  display_name: string | null;
  gender: Gender;
  theme_mode: ThemeMode;
  locale: string;
  city: string | null;
  country: string | null;
};

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

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
    <div className="flex flex-1 flex-col gap-5 p-4 pb-6">
      <h1 className="font-serif text-3xl font-bold">{t("title")}</h1>

      {/* Identity row (ref 3): avatar + camera badge + name */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-muted-foreground">
            {profile?.display_name ? profile.display_name[0].toUpperCase() : <User className="size-10" />}
          </div>
          <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm">
            <Camera className="size-4" />
          </span>
        </div>
        <p className="font-serif text-xl font-semibold">{shownName}</p>
      </div>

      <StoryCard />

      <section>
        <h2 className="mb-3 font-serif text-xl font-bold">{t("myActivity")}</h2>
        <ActivityFeed name={shownName} />
      </section>

      {isGuest && (
        <Card className="border-accent bg-accent/20">
          <CardContent className="space-y-3 py-4">
            <p className="text-sm">{t("guestBanner")}</p>
            <div className="space-y-2">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} />
              <Button size="sm" onClick={linkEmail} disabled={!email || password.length < 6}>
                {t("saveAccount")}
              </Button>
              {GOOGLE_ENABLED && (
                <Button size="sm" variant="outline" onClick={linkGoogle}>{t("continueGoogle")}</Button>
              )}
              {authMsg && <p className="text-xs text-muted-foreground">{authMsg}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardContent className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Button
                size="sm"
                onClick={() =>
                  save({ display_name: name }).then(() =>
                    setProfile((p) => (p ? { ...p, display_name: name } : p)),
                  )
                }
              >
                {t("save")}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>{t("gender")}</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={gender === "ikhwan" ? "default" : "outline"} onClick={() => pickGender("ikhwan")}>{t("ikhwan")}</Button>
              <Button size="sm" variant={gender === "akhwat" ? "default" : "outline"} onClick={() => pickGender("akhwat")}>{t("akhwat")}</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>{t("darkMode")}</Label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((m) => (
                <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => pickMode(m)}>
                  {t(m)}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <div className="flex gap-2">
              {(["id", "en", "ms"] as const).map((l) => (
                <Button key={l} size="sm" variant={locale === l ? "default" : "outline"} onClick={() => pickLocale(l)}>
                  {nav(l)}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>{t("city")}</Label>
            <div className="flex gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
              <Button size="sm" onClick={() => save({ city })}>{t("save")}</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("country")}</Label>
            <div className="flex gap-2">
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              <Button size="sm" onClick={() => save({ country })}>{t("save")}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isGuest && (
        <Button variant="outline" onClick={logout}>{t("logout")}</Button>
      )}
    </div>
  );
}
