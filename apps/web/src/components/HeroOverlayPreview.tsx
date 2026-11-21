"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PauseIcon, PlayIcon } from "./Icons";

interface ChatMessage {
  id: string;
  author: string;
  badge?: string;
  authorColor: string;
  text: string;
}

const SAMPLE_MESSAGES: readonly ChatMessage[] = [
  {
    id: "m1",
    author: "LariJoga",
    badge: "MOD",
    authorColor: "text-[#FFCD04]",
    text: "essa build em 1 monitor ficou muito limpa!",
  },
  {
    id: "m2",
    author: "GuiFPS",
    authorColor: "text-[#F38A0F]",
    text: "nem tampa o minimapa ali em cima, bom demais 🔥",
  },
  {
    id: "m3",
    author: "Bia_Live",
    badge: "SUB",
    authorColor: "text-[#7CE8B5]",
    text: "salve! qual a opacidade que você tá usando?",
  },
  {
    id: "m4",
    author: "NicoPlay",
    authorColor: "text-[#8CC8FF]",
    text: "os cliques não travam a mira mesmo?",
  },
];

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function ChatMessageContent({
  msg,
  transparentBg,
}: {
  msg: ChatMessage;
  transparentBg: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg px-2.5 py-1.5 text-xs leading-snug",
        transparentBg
          ? "bg-[#140A03]/55 text-white shadow-[0_1px_8px_rgba(0,0,0,0.45)]"
          : "bg-black/35 text-zinc-100",
      ].join(" ")}
    >
      {msg.badge ? (
        <span className="mr-1.5 inline-block rounded bg-[#F38A0F]/25 px-1 py-0.2 font-mono text-[10px] font-semibold text-[#FFCD04]">
          {msg.badge}
        </span>
      ) : null}
      <span className={`font-semibold ${msg.authorColor}`}>{msg.author}:</span>{" "}
      <span>{msg.text}</span>
    </div>
  );
}

export function HeroOverlayPreview() {
  const sliderId = useId();
  const [transparentBg, setTransparentBg] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [opacity, setOpacity] = useState(88);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(SAMPLE_MESSAGES.length);

  const prefersReducedMotion = useReducedMotion();
  const isPageHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );

  const shouldLoop = prefersReducedMotion === false && !isPaused && !isPageHidden;

  useEffect(() => {
    if (!shouldLoop) return;

    let timer: number | undefined;
    let cancelled = false;

    function scheduleNext(currentCount: number, initialCycle: boolean) {
      if (cancelled) return;

      let delay = 1050;
      let nextCount = currentCount + 1;

      if (initialCycle && currentCount === SAMPLE_MESSAGES.length) {
        delay = 1400;
        nextCount = 0;
      } else if (currentCount === 0) {
        delay = 340;
        nextCount = 1;
      } else if (currentCount >= SAMPLE_MESSAGES.length) {
        delay = 2600;
        nextCount = 0;
      }

      timer = window.setTimeout(() => {
        if (cancelled) return;
        setVisibleCount(nextCount);
        scheduleNext(nextCount, false);
      }, delay);
    }

    // When resuming from paused or starting fresh, begin cleanly from a brief reset
    if (isPaused) return;
    scheduleNext(SAMPLE_MESSAGES.length, true);

    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [shouldLoop, isPaused]);

  const displayedCount =
    prefersReducedMotion || isPaused ? SAMPLE_MESSAGES.length : visibleCount;
  const visibleMessages = SAMPLE_MESSAGES.slice(0, displayedCount);

  return (
    <div className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-3 shadow-2xl shadow-black/50 sm:p-4">
      {/* Window chrome representing a 1-monitor Windows game */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#4D2812] bg-[#140B04]"
        aria-label="Simulação visual do Toranja Overlay sobre um jogo em 1 monitor"
      >
        {/* Stylized game backdrop */}
        <div className="relative min-h-[300px] sm:min-h-[340px] w-full select-none overflow-hidden bg-[radial-gradient(circle_at_24%_22%,rgba(243,138,15,0.24),transparent_48%),radial-gradient(circle_at_78%_76%,rgba(255,205,4,0.16),transparent_46%),linear-gradient(155deg,#180E06_0%,#2A1205_52%,#110803_100%)] p-3.5 sm:p-5">
          {/* Subtle tactical grid in the game background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(243,138,15,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,138,15,0.2)_1px,transparent_1px)] [background-size:32px_32px]"
          />

          {/* Simulated game horizon / arena glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#300E00]/80 to-transparent"
          />

          {/* Top game HUD strip */}
          <div className="relative z-0 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#EEDFD0]/85">
            <div className="flex items-center gap-2 rounded-lg border border-[#F38A0F]/25 bg-[#1E1208]/75 px-2.5 py-1 backdrop-blur-xs">
              <span className="size-2 rounded-full bg-[#4ADE80]" aria-hidden="true" />
              <span>JOGO · JANELA SEM BORDAS</span>
            </div>
            <div className="rounded-lg border border-[#4D2812] bg-[#1E1208]/75 px-2.5 py-1 text-[#FFCD04]">
              144 FPS · 1 MONITOR
            </div>
          </div>

          {/* Simulated center crosshair & mini-objective so transparency difference is unmistakable */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35"
          >
            <div className="relative size-16 rounded-full border border-[#FFCD04]/50">
              <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFCD04]" />
            </div>
          </div>

          {/* Simulated right-side game elements BEHIND the overlay to prove transparency */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-16 flex flex-col items-end gap-2 opacity-85"
          >
            <div className="rounded-lg border border-[#F38A0F]/45 bg-[#300E00]/90 px-2.5 py-1 font-mono text-[10px] text-[#FFCD04]">
              OBJETIVO B · 42m
            </div>
            <div className="size-24 rounded-full bg-[radial-gradient(circle,rgba(243,138,15,0.52)_0%,transparent_70%)]" />
          </div>

          <div className="relative z-10 mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Left-side game HUD (HP + Radar) */}
            <div
              aria-hidden="true"
              className="pointer-events-none hidden w-36 shrink-0 flex-col gap-2.5 sm:flex"
            >
              <div className="rounded-xl border border-[#4D2812] bg-[#1E1208]/80 p-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#C9AB91]">
                  Minimapa
                </p>
                <div className="mt-1.5 flex h-16 items-center justify-center rounded-lg border border-[#F38A0F]/25 bg-[#300E00]/60">
                  <span className="size-2.5 rounded-full bg-[#FFCD04] shadow-[0_0_12px_#FFCD04]" />
                </div>
              </div>
              <div className="rounded-xl border border-[#4D2812] bg-[#1E1208]/80 px-2.5 py-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#EEDFD0]">
                  <span>HP</span>
                  <span className="text-[#FFCD04]">100%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#300E00]">
                  <div className="h-full w-4/5 rounded-full bg-[#F38A0F]" />
                </div>
              </div>
            </div>

            {/* Toranja Overlay Floating Window */}
            <div
              className={[
                "relative z-10 w-full sm:ml-auto sm:w-[min(100%,300px)] rounded-2xl transition-all duration-200",
                transparentBg
                  ? "bg-[#1E1208]/18 backdrop-blur-[1px]"
                  : "bg-[#22262E] border border-white/15 shadow-2xl",
                editMode
                  ? "border-2 border-dashed border-[#F38A0F] bg-[#1E1208]/60 p-3 shadow-[0_0_0_1px_rgba(255,205,4,0.2)]"
                  : transparentBg
                    ? "border border-transparent p-2.5"
                    : "p-3",
              ].join(" ")}
            >
              {/* 8 resize corner/edge handles shown only in Edit Mode */}
              <AnimatePresence>
                {editMode ? (
                  <motion.div
                    aria-hidden="true"
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                  >
                    <span className="absolute -left-1.5 -top-1.5 size-3 rounded-xs border border-[#1E1208] bg-[#FFCD04]" />
                    <span className="absolute left-1/2 -top-1.5 h-2.5 w-4 -translate-x-1/2 rounded-xs border border-[#1E1208] bg-[#F38A0F]" />
                    <span className="absolute -right-1.5 -top-1.5 size-3 rounded-xs border border-[#1E1208] bg-[#FFCD04]" />
                    <span className="absolute -left-1.5 top-1/2 h-4 w-2.5 -translate-y-1/2 rounded-xs border border-[#1E1208] bg-[#F38A0F]" />
                    <span className="absolute -right-1.5 top-1/2 h-4 w-2.5 -translate-y-1/2 rounded-xs border border-[#1E1208] bg-[#F38A0F]" />
                    <span className="absolute -bottom-1.5 -left-1.5 size-3 rounded-xs border border-[#1E1208] bg-[#FFCD04]" />
                    <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-4 -translate-x-1/2 rounded-xs border border-[#1E1208] bg-[#F38A0F]" />
                    <span className="absolute -bottom-1.5 -right-1.5 size-3 rounded-xs border border-[#1E1208] bg-[#FFCD04]" />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Overlay state pill */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                    editMode
                      ? "bg-[#F38A0F] text-[#1E1208]"
                      : transparentBg
                        ? "border border-[#FFCD04]/45 bg-[#1E1208]/80 text-[#FFCD04]"
                        : "bg-white/10 text-zinc-200",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${editMode ? "bg-[#1E1208]" : "bg-[#FFCD04]"}`}
                  />
                  {editMode
                    ? "MODO EDIÇÃO · 8 CANTOS"
                    : transparentBg
                      ? "FIXO · CLICK-THROUGH"
                      : "JANELA COMUM (OPACA)"}
                </span>

                <span className="font-mono text-[10px] text-[#EEDFD0]/85">{opacity}%</span>
              </div>

              {/* Simulated Social Stream Ninja chat messages with zero-CLS grid height reservation */}
              <div className="grid">
                <ul
                  aria-hidden="true"
                  className="invisible col-start-1 row-start-1 space-y-1.5 select-none pointer-events-none"
                >
                  {SAMPLE_MESSAGES.map((msg) => (
                    <li key={msg.id}>
                      <ChatMessageContent msg={msg} transparentBg={transparentBg} />
                    </li>
                  ))}
                </ul>

                <ul
                  className="col-start-1 row-start-1 flex flex-col justify-end space-y-1.5 transition-opacity duration-150"
                  style={{ opacity: opacity / 100 }}
                >
                  <AnimatePresence initial={false}>
                    {visibleMessages.map((msg) => (
                      <motion.li
                        key={msg.id}
                        layout={prefersReducedMotion ? false : "position"}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.26,
                                ease: [0.22, 1, 0.36, 1],
                                layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                              }
                        }
                      >
                        <ChatMessageContent msg={msg} transparentBg={transparentBg} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>

              <p className="mt-2 font-mono text-[10px] text-[#EEDFD0]/80">
                {editMode
                  ? "Arraste ou redimensione · Esc para fixar"
                  : transparentBg
                    ? "Cliques atravessam direto para o jogo"
                    : "Fundo sólido tampa o cenário e bloqueia cliques"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive controls to test the mirror effect live */}
      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#4D2812]/80 bg-[#1E1208]/80 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={transparentBg}
            onClick={() => setTransparentBg((prev) => !prev)}
            className={[
              "inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors",
              transparentBg
                ? "border-[#F38A0F] bg-[#F38A0F]/15 text-[#FFCD04]"
                : "border-[#4D2812] bg-[#28170B] text-[#EEDFD0] hover:border-[#F38A0F]",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${transparentBg ? "bg-[#F38A0F]" : "bg-[#734D34]"}`}
            />
            <span>Efeito espelho: {transparentBg ? "Ligado" : "Desligado"}</span>
          </button>

          <button
            type="button"
            aria-pressed={editMode}
            onClick={() => setEditMode((prev) => !prev)}
            className={[
              "inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors",
              editMode
                ? "border-[#FFCD04] bg-[#FFCD04]/15 text-[#FFCD04]"
                : "border-[#4D2812] bg-[#28170B] text-[#EEDFD0] hover:border-[#F38A0F]",
            ].join(" ")}
          >
            <span>{editMode ? "Modo edição" : "Modo fixo"}</span>
          </button>

          {prefersReducedMotion === false ? (
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? "Retomar animação do chat" : "Pausar animação do chat"}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#4D2812] bg-[#28170B] text-[#C9AB91] transition-colors hover:border-[#F38A0F] hover:text-[#FFCD04]"
            >
              {isPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
            </button>
          ) : null}
        </div>

        <div className="flex min-h-[44px] flex-1 items-center gap-3 sm:max-w-[230px]">
          <label
            htmlFor={sliderId}
            className="whitespace-nowrap text-xs font-medium text-[#C9AB91]"
          >
            Opacidade
          </label>
          <input
            id={sliderId}
            type="range"
            min={20}
            max={100}
            value={opacity}
            aria-valuetext={`${opacity}%`}
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="h-6 w-full cursor-pointer accent-[#F38A0F]"
          />
          <span className="w-10 text-right font-mono text-xs font-semibold text-[#FFCD04]">
            {opacity}%
          </span>
        </div>
      </div>
    </div>
  );
}
