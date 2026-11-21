"use client";

import { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SITE } from "@/lib/site";
import { CopyCommandButton } from "./CopyCommandButton";
import { DownloadIcon, ExternalLinkIcon } from "./Icons";

type InstallTabId = "installer" | "portable" | "chocolatey";

interface TabDefinition {
  id: InstallTabId;
  label: string;
}

const TABS: readonly TabDefinition[] = [
  { id: "installer", label: "Instalador (.exe)" },
  { id: "portable", label: "Versão Portátil (.zip)" },
  { id: "chocolatey", label: "Chocolatey (CLI)" },
];

export function InstallTabs() {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<InstallTabId>("installer");
  const tabRefs = useRef<Partial<Record<InstallTabId, HTMLButtonElement | null>>>({});
  const prefersReducedMotion = useReducedMotion();

  function selectAndFocusTab(tabId: InstallTabId) {
    setActiveTab(tabId);
    const el = tabRefs.current[tabId];
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      selectAndFocusTab(TABS[nextIndex].id);
    }
  }

  const getTabDomId = (id: InstallTabId) => `${baseId}-tab-${id}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-[#4D2812] bg-[#28170B]/95 shadow-2xl shadow-black/40">
      <div
        role="tablist"
        aria-label="Métodos de instalação no Windows"
        className="flex overflow-x-auto border-b border-[#4D2812] bg-[#1E1208]/75 px-2 pt-2 sm:px-4"
      >
        {TABS.map((tab, index) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              id={getTabDomId(tab.id)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => selectAndFocusTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={[
                "relative flex-none whitespace-nowrap min-h-[48px] px-4 py-3 text-sm font-semibold transition-colors",
                isSelected
                  ? "text-[#FFCD04]"
                  : "text-[#C9AB91] hover:text-white",
              ].join(" ")}
            >
              <span>{tab.label}</span>
              {isSelected ? (
                <motion.span
                  layoutId="install-tab-indicator"
                  data-slot="install-tab-indicator"
                  aria-hidden="true"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                  className="pointer-events-none absolute inset-x-2 bottom-0 block rounded-full border-b-[3px] border-[#F38A0F]"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Tab Panel 1: Instalador (.exe) */}
      <div
        role="tabpanel"
        aria-labelledby={getTabDomId("installer")}
        hidden={activeTab !== "installer"}
      >
        <div className="install-panel-body p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#FFCD04] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1E1208]">
              Recomendado
            </span>
            <span className="font-mono text-xs text-[#C9AB91]">
              Windows 10 / 11 (64 bits) · v{SITE.version}
            </span>
          </div>

          <h3 className="mt-4 font-display text-2xl font-semibold text-white">
            Instalador Windows NSIS (.exe)
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            Instala diretamente para o usuário atual sem exigir permissões de administrador,
            cria atalho no Menu Iniciar, inclui desinstalador e baixa o WebView2 oficial da
            Microsoft caso seu Windows 10 ainda não o tenha.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={SITE.installerUrl}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-[#F38A0F] px-6 py-3 text-sm font-bold text-[#1E1208] shadow-lg shadow-[#F38A0F]/20 transition-colors hover:bg-[#FFCD04]"
            >
              <DownloadIcon className="size-5 shrink-0" />
              <span>Baixar {SITE.installerFileName}</span>
            </a>
            <span className="font-mono text-xs text-[#C9AB91]">
              ~2 MB · Instalador assinado pelo release v{SITE.version}
            </span>
          </div>

          <ol className="mt-6 grid gap-3 border-t border-[#4D2812]/80 pt-5 text-sm text-[#EEDFD0] sm:grid-cols-3">
            <li className="rounded-2xl border border-[#4D2812] bg-[#1E1208]/60 p-3.5">
              <span className="font-mono text-xs font-semibold text-[#F38A0F]">Passo 1</span>
              <p className="mt-1">Execute o arquivo <code>.exe</code> baixado no Windows 10 ou 11.</p>
            </li>
            <li className="rounded-2xl border border-[#4D2812] bg-[#1E1208]/60 p-3.5">
              <span className="font-mono text-xs font-semibold text-[#F38A0F]">Passo 2</span>
              <p className="mt-1">
                Se o SmartScreen avisar, clique em <strong>Mais informações</strong> e{" "}
                <strong>Executar assim mesmo</strong>.
              </p>
            </li>
            <li className="rounded-2xl border border-[#4D2812] bg-[#1E1208]/60 p-3.5">
              <span className="font-mono text-xs font-semibold text-[#F38A0F]">Passo 3</span>
              <p className="mt-1">
                Abra pelo Menu Iniciar, cole o link do Social Stream Ninja e comece a stream.
              </p>
            </li>
          </ol>
        </div>
      </div>

      {/* Tab Panel 2: Versão Portátil (.zip) */}
      <div
        role="tabpanel"
        aria-labelledby={getTabDomId("portable")}
        hidden={activeTab !== "portable"}
      >
        <div className="install-panel-body p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-[#F38A0F]/50 bg-[#F38A0F]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FFCD04]">
              Sem instalação
            </span>
            <span className="font-mono text-xs text-[#C9AB91]">
              Arquivo ZIP · v{SITE.version} x64
            </span>
          </div>

          <h3 className="mt-4 font-display text-2xl font-semibold text-white">
            Versão Portátil (.zip)
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            Prefere não rodar um instalador? Basta extrair a pasta compactada em qualquer
            diretório do seu PC (ou pendrive) e executar{" "}
            <code className="rounded bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
              toranja-overlay.exe
            </code>{" "}
            diretamente.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={SITE.portableUrl}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-[#F38A0F] px-6 py-3 text-sm font-bold text-[#1E1208] shadow-lg shadow-[#F38A0F]/20 transition-colors hover:bg-[#FFCD04]"
            >
              <DownloadIcon className="size-5 shrink-0" />
              <span>Baixar {SITE.portableFileName}</span>
            </a>
            <span className="font-mono text-xs text-[#C9AB91]">
              Extraia e abra <code className="text-[#EEDFD0]">toranja-overlay.exe</code>
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-[#4D2812] bg-[#1E1208]/60 p-4 text-sm text-[#EEDFD0]">
            Suas configurações continuam sendo salvas localmente em{" "}
            <code className="rounded bg-[#28170B] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
              %APPDATA%\br.com.toranjatech.overlay\settings.json
            </code>{" "}
            para você não perder posição e opacidade entre atualizações.
          </div>
        </div>
      </div>

      {/* Tab Panel 3: Chocolatey (CLI) */}
      <div
        role="tabpanel"
        aria-labelledby={getTabDomId("chocolatey")}
        hidden={activeTab !== "chocolatey"}
      >
        <div className="install-panel-body p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-[#FFCD04]/50 bg-[#FFCD04]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FFCD04]">
              Via terminal PowerShell
            </span>
            <span className="font-mono text-xs text-[#C9AB91]">Gerenciador Chocolatey</span>
          </div>

          <h3 className="mt-4 font-display text-2xl font-semibold text-white">
            Instalação pelo Chocolatey (CLI)
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            Para quem prefere instalar e atualizar pacotes no Windows pela linha de comando:
          </p>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#4D2812] bg-[#1E1208] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <pre
              role="region"
              aria-label="Comando de instalação no Chocolatey"
              tabIndex={0}
              className="overflow-x-auto py-1 font-mono text-sm text-[#FFCD04]"
            >
              <code>{SITE.chocolateyCommand}</code>
            </pre>
            <CopyCommandButton
              command={SITE.chocolateyCommand}
              label={`Copiar comando ${SITE.chocolateyCommand}`}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-[#FFCD04]/45 bg-[#300E00]/80 p-4 text-sm leading-relaxed text-[#EEDFD0]">
            <p className="font-semibold text-[#FFCD04]">
              Aviso de moderação no Chocolatey
            </p>
            <p className="mt-1">
              O pacote oficial ainda está passando pelo processo de moderação automatizada na
              Galeria Chocolatey. Enquanto a aprovação é concluída, use o{" "}
              <strong>Instalador (.exe)</strong> ou a <strong>Versão Portátil (.zip)</strong>{" "}
              nas abas ao lado.{" "}
              <a
                href={SITE.chocolateyPackageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-[#FFCD04] underline decoration-[#F38A0F] underline-offset-4 hover:text-white"
              >
                <span>Acompanhar status no Chocolatey</span>
                <ExternalLinkIcon className="size-3.5 shrink-0" />
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#4D2812]/80 bg-[#1E1208]/60 px-5 py-3.5 text-xs text-[#C9AB91] sm:px-8">
        <span>Precisa de versões anteriores ou dos hashes SHA-256?</span>
        <a
          href={SITE.releasesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-[#FFCD04] underline decoration-[#F38A0F]/60 underline-offset-4 hover:text-white"
        >
          <span>Abrir GitHub Releases (v{SITE.version})</span>
          <ExternalLinkIcon className="size-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}
