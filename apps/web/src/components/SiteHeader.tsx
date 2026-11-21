"use client";

import Image from "next/image";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { DownloadIcon, MenuIcon } from "./Icons";

const emptySubscribe = () => () => {};

function useSupportsPopover(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => Object.hasOwn(HTMLElement.prototype, "popover"),
    () => true
  );
}

export function SiteHeader() {
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const supportsPopover = useSupportsPopover();
  const [fallbackOpen, setFallbackOpen] = useState(false);

  function closeMenu() {
    if (supportsPopover) {
      try {
        popoverRef.current?.hidePopover?.();
      } catch {
        // Ignore if popover is already dismissed
      }
    } else {
      setFallbackOpen(false);
    }
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <header className="sticky top-0 z-40 border-b border-[#4D2812]/90 bg-[#1E1208]/88 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-2.5 sm:px-6">
          <a
            href="#topo"
            className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl px-1.5 text-white transition-colors hover:text-[#FFCD04]"
          >
            <Image
              src="/icon.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg"
              priority
            />
            <span className="font-display text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg">
              {SITE.name}
            </span>
          </a>

          <nav aria-label="Principal" className="flex items-center gap-2">
            <ul className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-[#EEDFD0] transition-colors hover:bg-[#300E00]/80 hover:text-[#FFCD04]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#instalar"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#F38A0F] px-3.5 text-sm font-semibold text-[#1E1208] shadow-sm transition-colors hover:bg-[#FFCD04] whitespace-nowrap sm:px-4"
            >
              <DownloadIcon className="size-4 shrink-0" />
              <span>Baixar</span>
            </a>

            <button
              type="button"
              popoverTarget={supportsPopover ? popoverId : undefined}
              popoverTargetAction={supportsPopover ? "toggle" : undefined}
              aria-controls={popoverId}
              aria-expanded={supportsPopover ? undefined : fallbackOpen}
              aria-label="Abrir menu de navegação"
              onClick={() => {
                if (!supportsPopover) {
                  setFallbackOpen((prev) => !prev);
                }
              }}
              className="mobile-nav-trigger inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#4D2812] bg-[#28170B] px-2.5 text-[#EEDFD0] transition-colors hover:border-[#F38A0F] hover:text-white lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>

            <div
              ref={popoverRef}
              id={popoverId}
              popover={supportsPopover ? "auto" : undefined}
              hidden={!supportsPopover ? !fallbackOpen : undefined}
              className="mobile-nav-popover rounded-2xl border border-[#4D2812] bg-[#28170B] p-2 shadow-2xl lg:hidden"
            >
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={closeMenu}
                      className="flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-[#EEDFD0] transition-colors hover:bg-[#300E00] hover:text-[#FFCD04]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="mt-1 border-t border-[#4D2812] pt-2">
                  <a
                    href={SITE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="flex min-h-[48px] items-center justify-between rounded-xl px-4 text-sm font-medium text-[#C9AB91] transition-colors hover:bg-[#300E00] hover:text-white"
                  >
                    <span>Código no GitHub</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
