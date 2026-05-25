import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Apple,
  ArrowUpRight,
  Download,
  Github,
  Laptop,
  Monitor,
  Terminal,
} from 'lucide-react';

const SOURCE_URL = 'https://github.com/harupipipipi/rumiai';

const downloads = [
  {
    os: 'Windows',
    detail: 'x64 setup build',
    icon: Monitor,
  },
  {
    os: 'macOS',
    detail: 'Apple silicon and Intel builds',
    icon: Apple,
  },
  {
    os: 'Linux',
    detail: 'AppImage and deb builds',
    icon: Terminal,
  },
];

const signals = [
  'local-first desktop workspace',
  'AI conversations and tools in one place',
  'built from the rumiai desktop app',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-neutral-800">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/left_complete.webp"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: '32% center' }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.98)_0%,rgba(10,10,10,0.84)_38%,rgba(10,10,10,0.42)_72%,rgba(10,10,10,0.86)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.94)_0%,rgba(10,10,10,0.24)_36%,rgba(10,10,10,1)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <Link to="/home" className="flex items-center gap-3">
              <img
                src="/images/app_icon.webp"
                alt=""
                className="h-10 w-10 rounded-xl border border-white/10 bg-[#111111] object-cover"
                draggable={false}
              />
              <span className="text-sm font-semibold tracking-normal text-white">rumiai</span>
            </Link>

            <div className="flex items-center gap-2">
              <a
                href={SOURCE_URL}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                aria-label="Open rumiai on GitHub"
              >
                <Github size={18} />
              </a>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white text-sm font-medium text-[#0a0a0a] px-4 transition hover:bg-neutral-200"
              >
                Sign in
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.72fr)] lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs text-neutral-300">
                <Laptop size={14} />
                Desktop app builds from harupipipipi/rumiai
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                rumiai
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
                A quiet desktop home for AI chat, tools, and local workflows.
                Install builds for Windows, macOS, and Linux will live here as
                the desktop app releases are promoted.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {signals.map((signal) => (
                  <div
                    key={signal}
                    className="min-h-16 rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-sm leading-5 text-neutral-300"
                  >
                    {signal}
                  </div>
                ))}
              </div>

              <a
                href={SOURCE_URL}
                className="mt-6 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <Github size={16} className="shrink-0" />
                <span className="truncate">https://github.com/harupipipipi/rumiai</span>
                <ArrowUpRight size={15} className="shrink-0" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-4 shadow-2xl shadow-black/60"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Install rumiai</h2>
                  <p className="mt-1 text-sm leading-5 text-neutral-400">
                    Platform builds are staged through GitHub releases.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0a0a0a]">
                  <Download size={18} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {downloads.map(({ os, detail, icon: Icon }) => (
                  <button
                    key={os}
                    type="button"
                    disabled
                    className="flex min-h-20 w-full cursor-not-allowed items-center justify-between gap-4 rounded-lg border border-[#292929] bg-[#151515] px-4 py-3 text-left"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-neutral-200">
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white">{os}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
                          {detail}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-medium text-neutral-300">
                      Coming soon
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-xs leading-5 text-neutral-400">
                Installers are intentionally waiting for the large desktop PR to
                merge. After the official builds are published, these buttons can
                point directly to the release artifacts.
              </div>
            </motion.div>
          </div>

          <div className="relative pb-2">
            <div className="h-px w-full bg-white/10" />
            <div className="flex flex-col gap-2 pt-4 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
              <span>rumiai.dev/home</span>
              <a
                href={SOURCE_URL}
                className="inline-flex items-center gap-1 text-neutral-500 transition hover:text-neutral-300"
              >
                Source repository
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
