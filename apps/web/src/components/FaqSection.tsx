import { SITE } from "@/lib/site";
import { ChevronDownIcon, ExternalLinkIcon } from "./Icons";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCD04]">
          Dúvidas frequentes
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Perguntas comuns antes de começar
        </h2>
      </div>

      <div className="mt-10 space-y-3.5">
        <details className="faq-item rounded-2xl border border-[#4D2812] bg-[#28170B]/90 transition-colors open:border-[#F38A0F]/60">
          <summary className="flex min-h-[56px] items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white">
            <span>
              Por que o Windows SmartScreen exibe um aviso ao abrir o instalador?
            </span>
            <ChevronDownIcon className="faq-chevron size-5 shrink-0 text-[#F38A0F]" />
          </summary>
          <div className="border-t border-[#4D2812]/70 px-5 pb-5 pt-4 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            <p>
              O <strong>Toranja Overlay</strong> é um projeto open source independente e gratuito
              que ainda não possui um certificado comercial pago de assinatura de código (
              <em>EV Code Signing</em>). Por isso, o Microsoft Defender SmartScreen pode exibir a
              tela <em>&ldquo;O Windows protegeu o computador&rdquo;</em> nas primeiras execuções.
            </p>
            <p className="mt-3">
              Para abrir normalmente, clique em <strong>Mais informações</strong> e depois em{" "}
              <strong>Executar assim mesmo</strong>. Se quiser conferir a integridade do arquivo
              antes, compare o hash <code className="font-mono text-[#FFCD04]">SHA-256</code> com
              o arquivo{" "}
              <a
                href={SITE.releasesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#FFCD04] underline decoration-[#F38A0F] underline-offset-4 hover:text-white"
              >
                <span>SHA256SUMS.txt nos Releases</span>
                <ExternalLinkIcon className="size-3.5 shrink-0" />
              </a>{" "}
              usando o PowerShell:
            </p>
            <pre
              role="region"
              aria-label="Comando PowerShell para verificar SHA-256"
              tabIndex={0}
              className="mt-3 overflow-x-auto rounded-xl border border-[#4D2812] bg-[#1E1208] p-3 font-mono text-xs text-[#FFCD04]"
            >
              <code>{`Get-FileHash -Algorithm SHA256 .\\${SITE.installerFileName}`}</code>
            </pre>
          </div>
        </details>

        <details className="faq-item rounded-2xl border border-[#4D2812] bg-[#28170B]/90 transition-colors open:border-[#F38A0F]/60">
          <summary className="flex min-h-[56px] items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white">
            <span>O overlay funciona em jogos em Tela Cheia Exclusiva?</span>
            <ChevronDownIcon className="faq-chevron size-5 shrink-0 text-[#F38A0F]" />
          </summary>
          <div className="border-t border-[#4D2812]/70 px-5 pb-5 pt-4 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            <p>
              No Windows, jogos em <strong>Tela Cheia Exclusiva</strong> (
              <em>Exclusive Fullscreen</em>) assumem controle direto da placa de vídeo e impedem
              que outras janelas do sistema fiquem visíveis por cima.
            </p>
            <p className="mt-3">
              Para ver o chat sobre o jogo com transparência e sem travar, configure o jogo em{" "}
              <strong className="text-[#FFCD04]">Janela sem Bordas (Borderless Windowed)</strong>{" "}
              nas opções de vídeo do próprio jogo. Em jogos modernos com DirectX 12/Vulkan, o
              desempenho em Janela sem Bordas é praticamente idêntico à tela cheia.
            </p>
          </div>
        </details>

        <details className="faq-item rounded-2xl border border-[#4D2812] bg-[#28170B]/90 transition-colors open:border-[#F38A0F]/60">
          <summary className="flex min-h-[56px] items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white">
            <span>Preciso instalar o WebView2 manualmente?</span>
            <ChevronDownIcon className="faq-chevron size-5 shrink-0 text-[#F38A0F]" />
          </summary>
          <div className="border-t border-[#4D2812]/70 px-5 pb-5 pt-4 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            <p>
              Na grande maioria dos casos, não. O <strong>Microsoft Edge WebView2 Runtime</strong>{" "}
              já vem pré-instalado no Windows 11 e em quase todas as instalações atualizadas do
              Windows 10.
            </p>
            <p className="mt-3">
              Se por acaso ele estiver ausente no seu Windows 10, o próprio instalador{" "}
              <code className="font-mono text-[#FFCD04]">.exe</code> do Toranja Overlay baixa e
              instala o runtime oficial da Microsoft automaticamente durante a configuração.
            </p>
          </div>
        </details>

        <details className="faq-item rounded-2xl border border-[#4D2812] bg-[#28170B]/90 transition-colors open:border-[#F38A0F]/60">
          <summary className="flex min-h-[56px] items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white">
            <span>
              Como faço para mover ou ajustar o chat depois que ele entra em modo click-through?
            </span>
            <ChevronDownIcon className="faq-chevron size-5 shrink-0 text-[#F38A0F]" />
          </summary>
          <div className="border-t border-[#4D2812]/70 px-5 pb-5 pt-4 text-sm leading-relaxed text-[#EEDFD0] sm:text-base">
            <p>
              Pressione o atalho global{" "}
              <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                Ctrl + Shift + Alt + X
              </kbd>{" "}
              a qualquer momento (mesmo com o jogo aberto) para voltar ao{" "}
              <strong>Modo edição</strong> com a moldura tracejada laranja. Quando terminar de
              arrastar ou redimensionar, pressione{" "}
              <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                Esc
              </kbd>{" "}
              para fixar novamente. Você também pode ocultar ou exibir o chat com{" "}
              <kbd className="rounded border border-[#4D2812] bg-[#1E1208] px-1.5 py-0.5 font-mono text-xs text-[#FFCD04]">
                Ctrl + Shift + Alt + H
              </kbd>
              .
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
