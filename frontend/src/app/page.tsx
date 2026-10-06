import Link from "next/link";

const features = [
  {
    title: "Checklist Harian",
    description: "Catat tugas harian & ibadahmu",
    icon: "✅",
  },
  {
    title: "Jurnal",
    description: "Tulis refleksi pribadi & spiritual",
    icon: "📓",
  },
  {
    title: "Shalat Tracker",
    description: "Lacak shalat 5 waktu & riwayat",
    icon: "🕌",
  },
  {
    title: "Baca Quran",
    description: "Baca teks Arab, terjemahan & dengarkan audio",
    icon: "📖",
  },
  {
    title: "Kebiasaan",
    description: "Bangun kebiasaan spiritual dengan streak",
    icon: "🔄",
  },
  {
    title: "Progress",
    description: "Lihat perkembangan perjalanan ibadahmu",
    icon: "📊",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <span className="mb-6 text-5xl">🌙</span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Muslim Berislam
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Temani perjalanan spiritualmu. Catat ibadah, refleksikan hati, baca
          Quran, dan bangun kebiasaan baik — semua dalam satu ruang yang tenang.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/about"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </header>

      {/* Features Grid */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group flex flex-col gap-2 rounded-xl border bg-card p-6 transition-colors hover:bg-accent/50"
          >
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
