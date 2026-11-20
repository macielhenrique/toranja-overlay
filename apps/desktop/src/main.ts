import {
  getOverlayState,
  getSavedUrl,
  listenOverlayState,
  openSocialStreamSite,
  recoverOverlay,
  resetOverlayPosition,
  saveOverlayPosition,
  saveOverlayUrl,
  setOverlayAlwaysOnTop,
  setOverlayClickThrough,
  setOverlayEditMode,
  setOverlayOpacity,
  setOverlayTransparentBackground,
  setOverlayVisibility,
  startOverlay,
  stopOverlay,
  updateAutomationSettings,
} from "./api";
import { mountSidebar, type SidebarHandle } from "./components/sidebar";
import { getNavItem, resolveInitialRoute } from "./navigation";
import type {
  AutomationSettingsInput,
  FeedbackTone,
  OverlayState,
  RouteId,
} from "./types";
import { createAutomationView } from "./views/automation";
import { createConfigureView } from "./views/configure";
import { createOnboardingView } from "./views/onboarding";
import { createOverviewView, type ViewHandle } from "./views/overview";

// Carrega o polyfill apenas quando o atributo HTML switch não existe nativamente
if (!("switch" in HTMLInputElement.prototype)) {
  void import("input-switch-polyfill");
}

const sidebarRoot = document.querySelector<HTMLElement>("#sidebar-root")!;
const pageTitle = document.querySelector<HTMLElement>("#page-title")!;
const pageSubtitle = document.querySelector<HTMLElement>("#page-subtitle")!;
const feedbackBar = document.querySelector<HTMLElement>("#feedback-bar")!;
const viewRoot = document.querySelector<HTMLElement>("#view-root")!;
const a11yAnnouncer = document.querySelector<HTMLElement>("#a11y-announcer")!;

let appState: OverlayState = {
  running: false,
  visible: false,
  clickThrough: true,
  editMode: false,
  alwaysOnTop: true,
  opacity: 100,
  transparentBackground: true,
  sanitizedOrigin: null,
  x: 40,
  y: 40,
  width: 420,
  height: 680,
  savedUrlConfigured: false,
  savedUrlSanitized: null,
  savedX: 40,
  savedY: 40,
  savedWidth: 420,
  savedHeight: 680,
  autoOpenWithObs: false,
  restoreLastPosition: true,
  launchOnWindowsStartup: false,
  startPinned: true,
  onboardingCompleted: false,
  obsDetected: false,
  obsMonitoringActive: true,
  shortcuts: {
    toggleModeRegistered: true,
    toggleVisibilityRegistered: true,
  },
};

let draftUrl = "";
let savedUrl = "";
let busyCount = 0;
let activeView: ViewHandle | null = null;
let sidebarHandle: SidebarHandle | null = null;
let announceTimer: number | undefined;
let feedbackTimer: number | undefined;

function setFeedback(message: string, tone: FeedbackTone = "info"): void {
  feedbackBar.hidden = false;
  feedbackBar.textContent = message;
  feedbackBar.dataset.tone = tone;

  window.clearTimeout(announceTimer);
  a11yAnnouncer.textContent = "";
  announceTimer = window.setTimeout(() => {
    a11yAnnouncer.textContent = message;
  }, 250);

  window.clearTimeout(feedbackTimer);
  if (tone === "success" || tone === "info") {
    feedbackTimer = window.setTimeout(() => {
      feedbackBar.hidden = true;
    }, 6500);
  }
}

function clearFeedback(): void {
  feedbackBar.hidden = true;
  feedbackBar.textContent = "";
}

function isBusy(): boolean {
  return busyCount > 0;
}

function syncCurrentView(): void {
  activeView?.update(appState, draftUrl, isBusy(), savedUrl);
}

function applyState(nextState: OverlayState): void {
  appState = nextState;
  syncCurrentView();
}

async function runWithBusy<T>(task: () => Promise<T>): Promise<T | null> {
  busyCount += 1;
  syncCurrentView();
  try {
    return await task();
  } finally {
    busyCount = Math.max(0, busyCount - 1);
    syncCurrentView();
  }
}

function formatErrorMessage(err: unknown, fallback: string): string {
  return typeof err === "string" && err.trim().length > 0 ? err : fallback;
}

function navigateTo(route: RouteId): void {
  const meta = getNavItem(route);
  pageTitle.textContent = meta.pageTitle;
  pageSubtitle.textContent = meta.pageSubtitle;
  sidebarHandle?.updateActiveRoute(route);
  clearFeedback();

  if (route === "overview") {
    activeView = createOverviewView(appState, draftUrl, savedUrl, {
      onDraftUrlChange(value) {
        draftUrl = value;
      },
      async onSaveUrl(normalizedUrl) {
        await runWithBusy(async () => {
          try {
            const next = await saveOverlayUrl(normalizedUrl);
            draftUrl = normalizedUrl;
            savedUrl = normalizedUrl;
            applyState(next);
            setFeedback(
              `Link salvo localmente (${next.savedUrlSanitized ?? "HTTPS autorizado"}).`,
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Não foi possível salvar a URL."),
              "error"
            );
          }
        });
      },
      async onStartOverlay(urlToUse) {
        await runWithBusy(async () => {
          try {
            const next = await startOverlay({ url: urlToUse });
            if (urlToUse) {
              draftUrl = urlToUse;
              savedUrl = urlToUse;
            }
            applyState(next);
            setFeedback(
              next.editMode
                ? "Overlay iniciado em modo edição."
                : "Overlay iniciado em modo fixo (cliques passam para o jogo).",
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Não foi possível iniciar o overlay."),
              "error"
            );
          }
        });
      },
      async onToggleVisibility(visible) {
        await runWithBusy(async () => {
          try {
            const next = await setOverlayVisibility(visible);
            applyState(next);
            setFeedback(
              next.visible
                ? "Overlay visível na tela."
                : "Overlay ocultado temporariamente.",
              "info"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Não foi possível alterar a visibilidade."),
              "error"
            );
          }
        });
      },
      async onStopOverlay() {
        await runWithBusy(async () => {
          try {
            const next = await stopOverlay();
            applyState(next);
            setFeedback("Overlay encerrado com segurança.", "info");
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Erro ao encerrar o overlay."),
              "error"
            );
          }
        });
      },
      async onToggleEditMode(editMode) {
        await runWithBusy(async () => {
          try {
            const next = await setOverlayEditMode(editMode);
            applyState(next);
            setFeedback(
              next.editMode
                ? "Modo edição ativado: arraste ou redimensione a janela."
                : "Modo fixo ativado: cliques passam para o jogo.",
              next.editMode ? "warning" : "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Erro ao alternar modo da janela."),
              "error"
            );
          }
        });
      },
      async onRecoverOverlay() {
        await runWithBusy(async () => {
          try {
            const next = await recoverOverlay();
            applyState(next);
            setFeedback(
              "Overlay recuperado e aberto em modo edição para fácil visualização.",
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Não foi possível recuperar o overlay."),
              "error"
            );
          }
        });
      },
      onFeedback: setFeedback,
    });
  } else if (route === "configure") {
    activeView = createConfigureView(appState, {
      async onToggleAlwaysOnTop(enabled) {
        const res = await runWithBusy(async () => {
          try {
            const next = await setOverlayAlwaysOnTop(enabled);
            applyState(next);
            setFeedback(
              next.alwaysOnTop
                ? "Janela configurada para permanecer sempre visível."
                : "Sempre visível desativado.",
              "info"
            );
            return true;
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Falha ao alterar sempre visível."),
              "error"
            );
            return false;
          }
        });
        return Boolean(res);
      },
      async onToggleClickThrough(enabled) {
        const res = await runWithBusy(async () => {
          try {
            const next = await setOverlayClickThrough(enabled);
            applyState(next);
            setFeedback(
              next.clickThrough
                ? "Passagem de cliques ativada (cliques vão para o jogo)."
                : "Passagem de cliques desativada (o chat captura cliques).",
              "info"
            );
            return true;
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Falha ao alterar passagem de cliques."),
              "error"
            );
            return false;
          }
        });
        return Boolean(res);
      },
      async onToggleEditMode(editMode) {
        const res = await runWithBusy(async () => {
          try {
            const next = await setOverlayEditMode(editMode);
            applyState(next);
            setFeedback(
              next.editMode
                ? "Modo edição ativado: arraste ou redimensione a janela."
                : "Modo edição desativado: janela fixa sobre o jogo.",
              next.editMode ? "warning" : "success"
            );
            return true;
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Falha ao alternar modo edição."),
              "error"
            );
            return false;
          }
        });
        return Boolean(res);
      },
      onPreviewOpacity(opacity) {
        void setOverlayOpacity(opacity, false).catch(() => {});
      },
      async onCommitOpacity(opacity) {
        try {
          const next = await setOverlayOpacity(opacity, true);
          applyState(next);
          setFeedback(`Opacidade do overlay salva em ${next.opacity}%.`, "success");
        } catch (err) {
          setFeedback(
            formatErrorMessage(err, "Falha ao salvar a opacidade."),
            "error"
          );
        }
      },
      async onToggleTransparentBackground(enabled) {
        const res = await runWithBusy(async () => {
          try {
            const next = await setOverlayTransparentBackground(enabled);
            applyState(next);
            setFeedback(
              next.transparentBackground
                ? "Fundo transparente ativado (visualização tipo espelho sobre o jogo)."
                : "Fundo original da página do chat restaurado.",
              "info"
            );
            return true;
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Falha ao alterar fundo transparente."),
              "error"
            );
            return false;
          }
        });
        return Boolean(res);
      },
      async onSavePosition(bounds) {
        await runWithBusy(async () => {
          try {
            const next = await saveOverlayPosition(bounds);
            applyState(next);
            setFeedback(
              `Posição salva localmente: X=${next.savedX} px, Y=${next.savedY} px (${next.savedWidth}×${next.savedHeight} px).`,
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Erro ao salvar posição."),
              "error"
            );
          }
        });
      },
      async onResetPosition() {
        await runWithBusy(async () => {
          try {
            const next = await resetOverlayPosition();
            applyState(next);
            setFeedback(
              `Posição padrão restaurada (${next.savedX}, ${next.savedY} · ${next.savedWidth}×${next.savedHeight} px).`,
              "info"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Erro ao restaurar posição padrão."),
              "error"
            );
          }
        });
      },
      async onRecoverOverlay() {
        await runWithBusy(async () => {
          try {
            const next = await recoverOverlay();
            applyState(next);
            setFeedback(
              "Overlay recuperado em modo edição. Use Ctrl + Shift + Alt + X para fixar quando terminar.",
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(err, "Não foi possível recuperar o overlay."),
              "error"
            );
          }
        });
      },
      onFeedback: setFeedback,
    });
  } else if (route === "automation") {
    activeView = createAutomationView(appState, {
      async onUpdateAutomation(input: AutomationSettingsInput) {
        const res = await runWithBusy(async () => {
          try {
            const next = await updateAutomationSettings(input);
            applyState(next);
            setFeedback("Preferências de automação atualizadas.", "success");
            return true;
          } catch (err) {
            setFeedback(
              formatErrorMessage(
                err,
                "Não foi possível salvar as preferências de automação."
              ),
              "error"
            );
            return false;
          }
        });
        return Boolean(res);
      },
    });
  } else {
    activeView = createOnboardingView(appState, draftUrl, {
      onDraftUrlChange(value) {
        draftUrl = value;
      },
      async onSaveAndOpenOverlay(normalizedUrl) {
        await runWithBusy(async () => {
          try {
            const next = await startOverlay({ url: normalizedUrl });
            draftUrl = normalizedUrl;
            savedUrl = normalizedUrl;
            applyState(next);
            navigateTo("overview");
            setFeedback(
              "Configuração concluída! Overlay aberto e salvo localmente.",
              "success"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(
                err,
                "Não foi possível salvar e abrir o overlay."
              ),
              "error"
            );
          }
        });
      },
      async onOpenSocialStreamSite() {
        await runWithBusy(async () => {
          try {
            await openSocialStreamSite();
            setFeedback(
              "Abrindo socialstream.ninja no navegador padrão.",
              "info"
            );
          } catch (err) {
            setFeedback(
              formatErrorMessage(
                err,
                "Não foi possível abrir o site do Social Stream Ninja."
              ),
              "error"
            );
          }
        });
      },
      onFeedback: setFeedback,
    });
  }

  viewRoot.replaceChildren(activeView.element);
  syncCurrentView();
}

async function bootstrap(): Promise<void> {
  try {
    const [initialState, initialSavedUrl] = await Promise.all([
      getOverlayState(),
      getSavedUrl(),
    ]);
    appState = initialState;
    savedUrl = initialSavedUrl ?? "";
    draftUrl = savedUrl;

    const initialRoute = resolveInitialRoute(initialState);
    sidebarHandle = mountSidebar(sidebarRoot, initialRoute, navigateTo);
    navigateTo(initialRoute);

    await listenOverlayState((nextState) => {
      const prev = appState;
      applyState(nextState);

      if (!prev.obsDetected && nextState.obsDetected) {
        setFeedback(
          nextState.autoOpenWithObs && nextState.running
            ? "OBS Studio detectado — overlay iniciado automaticamente."
            : "OBS Studio detectado em execução no Windows.",
          "info"
        );
      } else if (prev.running && !nextState.running) {
        setFeedback("Overlay encerrado.", "info");
      } else if (prev.editMode !== nextState.editMode) {
        setFeedback(
          nextState.editMode
            ? "Modo edição ativado: arraste ou redimensione a janela."
            : "Modo fixo ativado: cliques passam para o jogo.",
          nextState.editMode ? "warning" : "success"
        );
      } else if (prev.visible !== nextState.visible && nextState.running) {
        setFeedback(
          nextState.visible
            ? "Overlay visível na tela."
            : "Overlay ocultado temporariamente.",
          "info"
        );
      }
    });
  } catch {
    const fallbackRoute = resolveInitialRoute(appState);
    sidebarHandle = mountSidebar(sidebarRoot, fallbackRoute, navigateTo);
    navigateTo(fallbackRoute);
    setFeedback(
      "Executando em modo de prévia no navegador (API nativa Tauri indisponível).",
      "warning"
    );
  }
}

void bootstrap();
