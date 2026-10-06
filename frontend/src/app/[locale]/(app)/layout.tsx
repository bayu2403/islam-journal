import BottomNav from "@/components/bottom-nav";
import WelcomeGate from "@/components/welcome-gate";

// App shell: phone-width column over Falak's star grid + aurora, floating dock.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-clip border-x bg-background">
      <div aria-hidden="true" className="fk-ground pointer-events-none absolute inset-x-0 top-0 -z-10 h-dvh" />
      <WelcomeGate />
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
