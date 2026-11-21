import Image from "next/image";
import { FaqSection } from "@/components/FaqSection";
import { HeroOverlayPreview } from "@/components/HeroOverlayPreview";
import {
  BoltAutomationIcon,
  DownloadIcon,
  ExternalLinkIcon,
  GitHubIcon,
  KeyboardIcon,
  MousePointerClickIcon,
  PinTopIcon,
  ResizeFrameIcon,
  ShieldLockIcon,
  SparkleLayersIcon,
} from "@/components/Icons";
import { InstallTabs } from "@/components/InstallTabs";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <div id="topo" className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-x-clip border-b border-[#4D2812]/70 bg-[radial-gradient(ellipse_at_top,rgba(243,138,15,0.16),transparent_58%),linear-gradient(180deg,#1E1208_0%,#261307_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[min(100%,46rem)] -translate-x-1/2 rounded-full bg-[#F38A0F]/12 blur-3xl"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#F38A0F]/40 bg-[#300E00]/80 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#FFCD04]">
                <Image
                  src="/icon.png"
                  alt=""
                  width={18}
                  height={18}
                  className="size-[18px] rounded-xs"
                  priority
                />
                <span className="font-mono uppercase">
                  Windows 10/11 · Open Source · 100% Local
                </span>
              </div>

              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Seu chat <span className="text-[#F38A0F]">sobre o jogo.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#EEDFD0] sm:text-lg">
                Feito para quem faz live no Windows usando apenas{" "}
                <strong className="font-semibold text-white">1 monitor</strong>. O Toranja
                Overlay transforma o dock do{" "}
                <a
                  href={SITE.socialStreamNinjaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#FFCD04] underline decoration-[#F38A0F]/70 underline-offset-4 hover:text-white"
                >
                  Social Stream Ninja
                </a>{" "}
                em uma janela transparente com <em>efeito espelho</em> e{" "}
                <strong className="font-semibold text-white">click-through</strong> — leia seu
                chat em cima do jogo sem perder um único clique.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={SITE.installerUrl}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-[#F38A0F] px-6 py-3.5 text-base font-bold text-[#1E1208] shadow-lg shadow-[#F38A0F]/25 transition-colors hover:bg-[#FFCD04]"
                >
                  <DownloadIcon className="size-5 shrink-0" />
                  <span>Baixar para Windows</span>
                </a>

                <a
                  href={SITE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-[#4D2812] bg-[#28170B] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-[#F38A0F] hover:bg-[#300E00]"
                >
                  <GitHubIcon className="size-5 shrink-0 text-[#FFCD04]" />
                  <span>Ver no GitHub</span>
                </a>
              </div>

              <p className="mt-3.5 font-mono text-xs text-[#C9AB91]">
                v{SITE.version} · x64 · ~2 MB · Gratuito e sem login
              </p>
            </div>

            <HeroOverlayPreview />
          </div>
        </section>

        {/* Por que existe */}
        <section
          id="por-que"
          className="mx-auto w-full max-w-6xl px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-16 sm:px-6 sm:py-20"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCD04]">
              Por que existe
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Streamar com 1 monitor não deveria obrigar você a dar Alt+Tab
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#EEDFD0]">
              O <strong className="text-white">Social Stream Ninja</strong> (
              <code className="rounded bg-[#28170B] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                dock.html
              </code>
              ) é excelente para unificar o chat das lives, mas navegadores comuns não oferecem
              transparência real de janela sobre jogos no Windows.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/85 p-6">
              <span className="inline-flex rounded-full border border-[#F38A0F]/40 bg-[#300E00] px-3 py-1 font-mono text-xs font-semibold text-[#F38A0F]">
                Problema 01
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                Fundo sólido tampando a tela
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
                No navegador ou janela padrão, o{" "}
                <code className="font-mono text-xs text-[#FFCD04]">dock.html</code> exibe um
                bloco cinza ou escuro opaco que cobre minimapas, barras de vida e partes
                importantes do jogo.
              </p>
            </article>

            <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/85 p-6">
              <span className="inline-flex rounded-full border border-[#F38A0F]/40 bg-[#300E00] px-3 py-1 font-mono text-xs font-semibold text-[#F38A0F]">
                Problema 02
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                Janela roubando cliques do mouse
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
                Se você coloca uma janela comum sobre o jogo, basta mexer a câmera ou clicar
                na área do chat para perder o foco da partida bem na hora da trocação.
              </p>
            </article>

            <article className="rounded-3xl border border-[#F38A0F]/55 bg-gradient-to-br from-[#300E00] via-[#28170B] to-[#1E1208] p-6 shadow-lg shadow-[#F38A0F]/10">
              <span className="inline-flex rounded-full bg-[#FFCD04] px-3 py-1 font-mono text-xs font-bold uppercase text-[#1E1208]">
                Solução Toranja
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                Efeito espelho + click-through
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
                O Toranja Overlay remove o fundo sólido padrão, deixa apenas as mensagens
                flutuando com opacidade ajustável e faz todo clique do mouse atravessar direto
                para o jogo.
              </p>
            </article>
          </div>
        </section>

        {/* Recursos */}
        <section
          id="recursos"
          className="border-y border-[#4D2812]/70 bg-[#300E00]/28"
        >
          <div className="mx-auto w-full max-w-6xl px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-16 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCD04]">
                Recursos
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Pensado nos detalhes da sua live
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#EEDFD0]">
                Construído nativamente para Windows com foco em leveza, visibilidade e controle
                rápido sem atrapalhar a gameplay.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <SparkleLayersIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Efeito espelho &amp; Opacidade (20%–100%)
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  Remove o fundo sólido padrão da página do chat e permite ajustar a opacidade
                  em tempo real para manter o equilíbrio perfeito entre leitura e visão do jogo.
                </p>
              </article>

              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <MousePointerClickIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Click-through (Modo fixo)
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  Quando fixado, o overlay ignora o cursor: todos os cliques do mouse e rolagem
                  atravessam a janela do chat e vão direto para o jogo em execução.
                </p>
              </article>

              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <PinTopIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Sempre visível (Always-on-Top)
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  Mantém suas mensagens sempre acima das demais janelas do Windows para você
                  acompanhar o chat continuamente sem precisar alternar telas.
                </p>
              </article>

              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <ResizeFrameIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Modo edição sem moldura
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  Uma janela dedicada com borda tracejada laranja permite arrastar e
                  redimensionar pelos 8 cantos e bordas sem quebrar a transparência nativa do
                  Windows.
                </p>
              </article>

              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <KeyboardIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Atalhos globais
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                    Ctrl + Shift + Alt + X
                  </kbd>{" "}
                  alterna entre edição e fixo;{" "}
                  <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                    Ctrl + Shift + Alt + H
                  </kbd>{" "}
                  mostra ou oculta o chat mesmo dentro do jogo.
                </p>
              </article>

              <article className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#F38A0F]/40 bg-[#300E00] text-[#F38A0F]">
                  <BoltAutomationIcon />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Automação com OBS &amp; Windows
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                  Inicia o overlay automaticamente ao detectar o OBS Studio (
                  <code className="font-mono text-xs text-[#FFCD04]">obs64.exe</code>,{" "}
                  <code className="font-mono text-xs text-[#FFCD04]">obs32.exe</code>,{" "}
                  <code className="font-mono text-xs text-[#FFCD04]">obs.exe</code>) e oferece
                  inicialização em segundo plano com o Windows (
                  <code className="font-mono text-xs text-[#FFCD04]">--background</code>).
                </p>
              </article>

              <article className="rounded-3xl border border-[#F38A0F]/40 bg-gradient-to-r from-[#28170B] via-[#300E00]/80 to-[#28170B] p-6 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFCD04]/40 bg-[#1E1208] text-[#FFCD04]">
                      <ShieldLockIcon className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-white">
                        100% Local e Privado
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
                        Sem conta, sem login, sem servidor próprio e sem telemetria. Seu link e
                        suas preferências ficam salvos exclusivamente no seu PC, com a webview do
                        chat isolada e sem permissões de sistema.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex self-start rounded-full border border-[#4D2812] bg-[#1E1208] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#FFCD04] sm:self-center">
                    MIT Open Source
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Como usar em 3 passos */}
        <section
          id="como-usar"
          className="mx-auto w-full max-w-6xl px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-16 sm:px-6 sm:py-20"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCD04]">
              Como usar
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pronto para jogar em 3 passos
            </h2>
          </div>

          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            <li className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#F38A0F] font-mono text-sm font-bold text-[#1E1208]">
                  01
                </span>
                <span className="font-mono text-xs text-[#C9AB91]">Social Stream Ninja</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                Gere o link no Social Stream Ninja (<code>dock.html</code>)
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                Acesse o{" "}
                <a
                  href={SITE.socialStreamNinjaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#FFCD04] underline decoration-[#F38A0F]/70 underline-offset-4 hover:text-white"
                >
                  Social Stream Ninja
                </a>
                , conecte seu chat e copie a URL do dock (
                <code className="font-mono text-xs text-[#FFCD04]">
                  https://socialstream.ninja/dock.html...
                </code>
                ).
              </p>
            </li>

            <li className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#F38A0F] font-mono text-sm font-bold text-[#1E1208]">
                  02
                </span>
                <span className="font-mono text-xs text-[#C9AB91]">Toranja Overlay</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                Cole no Toranja Overlay e clique em Iniciar overlay
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                Abra o Toranja Overlay, cole o link copiado no campo principal e clique em{" "}
                <strong className="text-white">Iniciar overlay</strong>. Nenhum cadastro é
                necessário.
              </p>
            </li>

            <li className="rounded-3xl border border-[#4D2812] bg-[#28170B]/90 p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#FFCD04] font-mono text-sm font-bold text-[#1E1208]">
                  03
                </span>
                <span className="font-mono text-xs text-[#C9AB91]">Sobre o jogo</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                Posicione no Modo edição, ajuste a transparência e aperte Fixar (ou Esc)
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#EEDFD0]">
                Arraste e redimensione pelos 8 cantos, escolha a opacidade ideal entre 20% e
                100% e clique em <strong className="text-white">Fixar</strong> (ou aperte{" "}
                <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                  Esc
                </kbd>
                ) para liberar os cliques para o jogo.
              </p>
            </li>
          </ol>

          <div className="mt-6 rounded-2xl border border-[#4D2812] bg-[#300E00]/55 px-5 py-4 text-sm text-[#EEDFD0]">
            <strong className="text-[#FFCD04]">Dica de ouro:</strong> nos gráficos do seu jogo,
            selecione o modo de exibição{" "}
            <strong className="text-white">Janela sem Bordas (Borderless Windowed)</strong> para
            que o Windows mantenha o overlay sempre visível por cima do jogo.
          </div>
        </section>

        {/* Instalar */}
        <section
          id="instalar"
          className="border-y border-[#4D2812]/70 bg-[radial-gradient(circle_at_top_right,rgba(243,138,15,0.12),transparent_50%),linear-gradient(180deg,#251308_0%,#1E1208_100%)]"
        >
          <div className="mx-auto w-full max-w-5xl px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-16 sm:px-6 sm:py-20">
            <div className="mb-8 text-center">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCD04]">
                Instalar
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Escolha como instalar no Windows
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-[#EEDFD0]">
                Compatível com Windows 10 e Windows 11 (64 bits). Código auditável e builds
                publicados diretamente no GitHub Releases.
              </p>
            </div>

            <InstallTabs />
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />
      </main>

      <footer className="border-t border-[#4D2812] bg-[#300E00]/45 pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-xl"
            />
            <div>
              <p className="font-display text-base font-semibold text-white">
                {SITE.brand} · {SITE.name}
              </p>
              <p className="text-xs text-[#C9AB91]">
                v{SITE.version} · Software livre sob{" "}
                <a
                  href={SITE.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#FFCD04] underline decoration-[#F38A0F]/60 underline-offset-4 hover:text-white"
                >
                  Licença MIT
                </a>
                .
              </p>
            </div>
          </div>

          <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={SITE.socialStreamNinjaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#EEDFD0] transition-colors hover:bg-[#28170B] hover:text-[#FFCD04]"
            >
              <span>Social Stream Ninja</span>
              <ExternalLinkIcon className="size-3.5 shrink-0" />
            </a>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#EEDFD0] transition-colors hover:bg-[#28170B] hover:text-[#FFCD04]"
            >
              <span>GitHub</span>
              <ExternalLinkIcon className="size-3.5 shrink-0" />
            </a>
            <a
              href={SITE.releasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#EEDFD0] transition-colors hover:bg-[#28170B] hover:text-[#FFCD04]"
            >
              <span>Releases</span>
              <ExternalLinkIcon className="size-3.5 shrink-0" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
