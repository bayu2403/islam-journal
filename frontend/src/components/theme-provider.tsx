"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Gender = "ikhwan" | "akhwat";
export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  gender: Gender;
  mode: ThemeMode;
  setGender: (g: Gender) => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

function applyTheme(gender: Gender, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.gender = gender;
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<Gender>("ikhwan");
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const g = (localStorage.getItem("mb.gender") as Gender) || "ikhwan";
    const m = (localStorage.getItem("mb.mode") as ThemeMode) || "system";
    // localStorage can only be read after mount — reading it in a useState
    // initializer would run during SSR/hydration and mismatch the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGenderState(g);
    setModeState(m);
    applyTheme(g, m);
  }, []);

  const setGender = useCallback(
    (g: Gender) => {
      setGenderState(g);
      localStorage.setItem("mb.gender", g);
      applyTheme(g, mode);
    },
    [mode],
  );

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m);
      localStorage.setItem("mb.mode", m);
      applyTheme(gender, m);
    },
    [gender],
  );

  return (
    <ThemeContext.Provider value={{ gender, mode, setGender, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside ThemeProvider");
  return ctx;
}
