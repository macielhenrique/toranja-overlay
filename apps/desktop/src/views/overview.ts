import { createStatusPill, updateStatusPill } from "../components/status-pill";
import { setFieldValidationError } from "../form-accessibility";
import { getHeroStatusCopy } from "../navigation";
import type { FeedbackTone, OverlayState } from "../types";
import { validateSocialStreamUrl } from "../url-validator";

export interface OverviewViewCallbacks {
  onDraftUrlChange: (value: string) => void;
  onSaveUrl: (normalizedUrl: string) => Promise<void>;
  onStartOverlay: (urlToUse: string | null) => Promise<void>;
  onToggleVisibility: (visible: boolean) => Promise<void>;
  onStopOverlay: () => Promise<void>;
  onToggleEditMode: (editMode: boolean) => Promise<void>;
  onRecoverOverlay: () => Promise<void>;
  onFeedback: (message: string, tone: FeedbackTone) => void;
}

export interface ViewHandle {
  element: HTMLElement;
  update: (
    state: OverlayState,
    draftUrl: string,
    isBusy: boolean,
    savedUrl?: string
  ) => void;
}

export function createOverviewView(
  initialState: OverlayState,
  initialDraftUrl: string,
  initialSavedUrl: string,
  callbacks: OverviewViewCallbacks
): ViewHandle {
  const root = document.createElement("div");
  root.className = "view-stack";

  // 1. Hero Card laranja
  const hero = document.createElement("section");
  hero.className = "hero-card";
  hero.setAttribute("aria-label", "Status do Toranja Overlay");

  const heroLeft = document.createElement("div");
  heroLeft.className = "hero-left";
  const heroHeading = document.createElement("h2");
  heroHeading.className = "hero-title";
  heroHeading.textContent = "Seu chat,\nsempre à vista.";
  const heroSubtitle = document.createElement("p");
  heroSubtitle.className = "hero-subtitle";
  heroSubtitle.textContent =
    "Acompanhe as mensagens da live sem precisar de um segundo monitor.";
  heroLeft.append(heroHeading, heroSubtitle);

  const heroRight = document.createElement("div");
  heroRight.className = "hero-right";
  const heroEyebrow = document.createElement("div");
  heroEyebrow.className = "hero-status-eyebrow";
  const heroDot = document.createElement("span");
  heroDot.className = "hero-dot";
  heroDot.setAttribute("aria-hidden", "true");
  const heroEyebrowText = document.createElement("span");
  heroEyebrow.append(heroDot, heroEyebrowText);

  const heroStatusTitle = document.createElement("strong");
  heroStatusTitle.className = "hero-status-title";
  const heroStatusDetail = document.createElement("p");
  heroStatusDetail.className = "hero-status-detail";
  heroRight.append(heroEyebrow, heroStatusTitle, heroStatusDetail);

  hero.append(heroLeft, heroRight);

  // 2. Link do Social Stream Ninja
  const urlCard = document.createElement("section");
  urlCard.className = "card";
  urlCard.setAttribute("aria-labelledby", "overview-url-heading");

  const urlHeader = document.createElement("div");
  urlHeader.className = "card-header-row";
  const urlHeaderCopy = document.createElement("div");
  const urlHeading = document.createElement("h2");
  urlHeading.id = "overview-url-heading";
  urlHeading.className = "card-title";
  urlHeading.textContent = "Link do Social Stream Ninja";
  const urlDesc = document.createElement("p");
  urlDesc.className = "card-subtitle";
  urlDesc.textContent = "Cole a URL gerada na sua sessão de chat.";
  urlHeaderCopy.append(urlHeading, urlDesc);

  const urlPill = createStatusPill({
    label: "Nenhum link salvo",
    tone: "neutral",
  });
  urlHeader.append(urlHeaderCopy, urlPill);

  const urlForm = document.createElement("form");
  urlForm.className = "url-form";
  urlForm.noValidate = true;

  const urlLabel = document.createElement("label");
  urlLabel.className = "visually-hidden";
  urlLabel.htmlFor = "overview-url-input";
  urlLabel.textContent = "Link do Social Stream Ninja";

  const urlInputRow = document.createElement("div");
  urlInputRow.className = "url-input-row";

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.id = "overview-url-input";
  urlInput.name = "ssnUrl";
  urlInput.required = true;
  urlInput.autocomplete = "off";
  urlInput.autocapitalize = "none";
  urlInput.spellcheck = false;
  urlInput.placeholder = "https://socialstream.ninja/dock.html?session=...";
  urlInput.setAttribute("aria-invalid", "false");
  urlInput.dataset.error = "overview-url-error";
  urlInput.value = initialDraftUrl;

  const btnSaveUrl = document.createElement("button");
  btnSaveUrl.type = "submit";
  btnSaveUrl.className = "btn btn-primary";
  btnSaveUrl.textContent = "Salvar link";

  urlInputRow.append(urlInput, btnSaveUrl);

  const urlError = document.createElement("span");
  urlError.id = "overview-url-error";
  urlError.className = "error-msg";
  urlError.textContent =
    "Informe uma URL HTTPS válida do domínio socialstream.ninja.";

  const urlSavedInfo = document.createElement("p");
  urlSavedInfo.className = "card-note";

  const urlPrivacyNote = document.createElement("p");
  urlPrivacyNote.className = "card-note";
  urlPrivacyNote.textContent =
    "O link fica salvo neste computador. Nenhum login é necessário.";

  urlForm.append(urlLabel, urlInputRow, urlError);
  urlCard.append(urlHeader, urlForm, urlSavedInfo, urlPrivacyNote);

  // 3. Grid inferior (Controle rápido + Estado da janela)
  const bottomGrid = document.createElement("div");
  bottomGrid.className = "overview-bottom-grid";

  // 3a. Controle rápido
  const quickCard = document.createElement("section");
  quickCard.className = "card";
  quickCard.setAttribute("aria-labelledby", "quick-control-heading");

  const quickTitle = document.createElement("h2");
  quickTitle.id = "quick-control-heading";
  quickTitle.className = "card-title";
  quickTitle.textContent = "Controle rápido";

  const quickActions = document.createElement("div");
  quickActions.className = "button-row";

  const btnQuickMain = document.createElement("button");
  btnQuickMain.type = "button";
  btnQuickMain.className = "btn btn-primary";

  const btnQuickStop = document.createElement("button");
  btnQuickStop.type = "button";
  btnQuickStop.className = "btn btn-secondary";
  btnQuickStop.textContent = "Encerrar";

  quickActions.append(btnQuickMain, btnQuickStop);

  const quickShortcutNote = document.createElement("p");
  quickShortcutNote.className = "card-note";

  const quickShortcutWarn = document.createElement("p");
  quickShortcutWarn.className = "card-warning";
  quickShortcutWarn.hidden = true;

  quickCard.append(quickTitle, quickActions, quickShortcutNote, quickShortcutWarn);

  // 3b. Estado da janela
  const windowCard = document.createElement("section");
  windowCard.className = "card";
  windowCard.setAttribute("aria-labelledby", "window-state-heading");

  const windowTitle = document.createElement("h2");
  windowTitle.id = "window-state-heading";
  windowTitle.className = "card-title";
  windowTitle.textContent = "Estado da janela";

  const windowStateRow = document.createElement("div");
  windowStateRow.className = "window-state-row";

  const windowStatePill = createStatusPill({
    label: "Desconectado",
    tone: "neutral",
  });

  const windowClicksLabel = document.createElement("span");
  windowClicksLabel.className = "window-clicks-label";

  const btnQuickMode = document.createElement("button");
  btnQuickMode.type = "button";
  btnQuickMode.className = "btn btn-secondary btn-compact";
  btnQuickMode.textContent = "Editar";

  windowStateRow.append(windowStatePill, windowClicksLabel, btnQuickMode);

  const windowNote = document.createElement("p");
  windowNote.className = "card-note";
  windowNote.textContent =
    "Mude para modo edição quando quiser ajustar a posição.";

  windowCard.append(windowTitle, windowStateRow, windowNote);
  bottomGrid.append(quickCard, windowCard);
  root.append(hero, urlCard, bottomGrid);

  let latestState = initialState;
  let latestDraft = initialDraftUrl;
  let savedNormalized =
    validateSocialStreamUrl(initialSavedUrl).normalizedUrl ?? null;

  function syncUrlPill(state: OverlayState, draft: string): void {
    const trimmed = draft.trim();
    if (!trimmed) {
      updateStatusPill(
        urlPill,
        state.savedUrlConfigured ? "Link salvo" : "Nenhum link salvo",
        state.savedUrlConfigured ? "success" : "neutral"
      );
      btnSaveUrl.textContent = "Salvar link";
      return;
    }

    const check = validateSocialStreamUrl(trimmed);
    if (!check.valid) {
      updateStatusPill(urlPill, "URL inválida", "error");
      btnSaveUrl.textContent = "Salvar link";
      return;
    }

    if (
      state.savedUrlConfigured &&
      savedNormalized !== null &&
      check.normalizedUrl === savedNormalized
    ) {
      updateStatusPill(urlPill, "Link salvo", "success");
      btnSaveUrl.textContent = "Salvar link";
    } else {
      updateStatusPill(
        urlPill,
        state.savedUrlConfigured ? "Alterações não salvas" : "Link pronto p/ salvar",
        "warning"
      );
      btnSaveUrl.textContent = state.savedUrlConfigured
        ? "Salvar novo link"
        : "Salvar link";
    }
  }

  urlInput.addEventListener("input", () => {
    latestDraft = urlInput.value;
    callbacks.onDraftUrlChange(latestDraft);
    if (urlInput.getAttribute("aria-invalid") === "true") {
      const check = validateSocialStreamUrl(latestDraft);
      if (check.valid) {
        setFieldValidationError(urlInput, urlError, null);
      }
    }
    syncUrlPill(latestState, latestDraft);
  });

  urlInput.addEventListener("blur", () => {
    const trimmed = urlInput.value.trim();
    if (trimmed.length > 0) {
      const check = validateSocialStreamUrl(trimmed);
      if (!check.valid) {
        setFieldValidationError(urlInput, urlError, check.reason);
      } else {
        setFieldValidationError(urlInput, urlError, null);
      }
    } else if (urlInput.getAttribute("aria-invalid") === "true") {
      setFieldValidationError(urlInput, urlError, null);
    }
    syncUrlPill(latestState, urlInput.value);
  });

  urlForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const check = validateSocialStreamUrl(urlInput.value);
    if (!check.valid || !check.normalizedUrl) {
      setFieldValidationError(
        urlInput,
        urlError,
        check.reason ?? "Informe uma URL HTTPS válida do Social Stream Ninja."
      );
      callbacks.onFeedback(
        check.reason ?? "URL inválida. Verifique o link informado.",
        "error"
      );
      urlInput.focus();
      syncUrlPill(latestState, urlInput.value);
      return;
    }

    setFieldValidationError(urlInput, urlError, null);
    savedNormalized = check.normalizedUrl;
    await callbacks.onSaveUrl(check.normalizedUrl);
  });

  btnQuickMain.addEventListener("click", async () => {
    if (!latestState.running) {
      const trimmed = urlInput.value.trim();
      if (trimmed.length > 0) {
        const check = validateSocialStreamUrl(trimmed);
        if (!check.valid || !check.normalizedUrl) {
          setFieldValidationError(
            urlInput,
            urlError,
            check.reason ?? "URL inválida."
          );
          callbacks.onFeedback(
            check.reason ?? "Corrija a URL antes de iniciar o overlay.",
            "error"
          );
          urlInput.focus();
          return;
        }
        setFieldValidationError(urlInput, urlError, null);
        savedNormalized = check.normalizedUrl;
        await callbacks.onStartOverlay(check.normalizedUrl);
      } else {
        await callbacks.onStartOverlay(null);
      }
      return;
    }

    await callbacks.onToggleVisibility(!latestState.visible);
  });

  btnQuickStop.addEventListener("click", async () => {
    await callbacks.onStopOverlay();
  });

  btnQuickMode.addEventListener("click", async () => {
    if (!latestState.running) {
      await callbacks.onRecoverOverlay();
      return;
    }
    if (!latestState.visible) {
      await callbacks.onRecoverOverlay();
      return;
    }
    await callbacks.onToggleEditMode(!latestState.editMode);
  });

  function update(
    state: OverlayState,
    draftUrl: string,
    isBusy: boolean,
    savedUrl?: string
  ): void {
    latestState = state;
    latestDraft = draftUrl;
    if (savedUrl !== undefined) {
      savedNormalized = validateSocialStreamUrl(savedUrl).normalizedUrl ?? null;
    }

    if (document.activeElement !== urlInput && urlInput.value !== draftUrl) {
      urlInput.value = draftUrl;
    }

    const heroCopy = getHeroStatusCopy(state);
    heroEyebrowText.textContent = heroCopy.eyebrow;
    heroDot.className = heroCopy.isLive ? "hero-dot hero-dot-live" : "hero-dot";
    heroStatusTitle.textContent = heroCopy.title;
    heroStatusDetail.textContent = heroCopy.detail;

    if (state.savedUrlConfigured && state.savedUrlSanitized) {
      urlSavedInfo.hidden = false;
      urlSavedInfo.textContent = `Origem configurada: ${state.savedUrlSanitized}`;
    } else {
      urlSavedInfo.hidden = true;
      urlSavedInfo.textContent = "";
    }

    syncUrlPill(state, draftUrl);

    if (!state.running) {
      btnQuickMain.textContent = "Iniciar overlay";
      btnQuickMain.disabled = isBusy || (!state.savedUrlConfigured && !draftUrl.trim());
      btnQuickStop.disabled = true;
    } else if (state.visible) {
      btnQuickMain.textContent = "Ocultar";
      btnQuickMain.disabled = isBusy;
      btnQuickStop.disabled = isBusy;
    } else {
      btnQuickMain.textContent = "Mostrar overlay";
      btnQuickMain.disabled = isBusy;
      btnQuickStop.disabled = isBusy;
    }

    btnSaveUrl.disabled = isBusy;

    quickShortcutNote.textContent =
      "Atalhos globais: Ctrl + Shift + Alt + X (editar/fixar) · Ctrl + Shift + Alt + H (mostrar/ocultar)";

    if (
      !state.shortcuts.toggleModeRegistered ||
      !state.shortcuts.toggleVisibilityRegistered
    ) {
      quickShortcutWarn.hidden = false;
      quickShortcutWarn.textContent =
        "Um ou mais atalhos globais estão em conflito com outro app em execução.";
    } else {
      quickShortcutWarn.hidden = true;
    }

    if (!state.running) {
      updateStatusPill(windowStatePill, "Desconectado", "neutral");
      windowClicksLabel.textContent = state.savedUrlConfigured
        ? "Pronto para abrir"
        : "Aguardando link";
      btnQuickMode.textContent = "Abrir p/ editar";
      btnQuickMode.disabled = isBusy || !state.savedUrlConfigured;
    } else if (!state.visible) {
      updateStatusPill(windowStatePill, "Overlay oculto", "warning");
      windowClicksLabel.textContent = "Janela oculta";
      btnQuickMode.textContent = "Recuperar";
      btnQuickMode.disabled = isBusy;
    } else if (state.editMode) {
      updateStatusPill(windowStatePill, "Modo edição", "warning");
      windowClicksLabel.textContent = "Cliques capturados";
      btnQuickMode.textContent = "Fixar";
      btnQuickMode.disabled = isBusy;
    } else {
      updateStatusPill(
        windowStatePill,
        state.clickThrough ? "Fixo sobre o jogo" : "Janela interativa",
        "success"
      );
      windowClicksLabel.textContent = state.clickThrough
        ? "Cliques liberados"
        : "Captura cliques";
      btnQuickMode.textContent = "Editar";
      btnQuickMode.disabled = isBusy;
    }
  }

  update(initialState, initialDraftUrl, false, initialSavedUrl);
  return { element: root, update };
}
