import { createSwitchRow } from "../components/switch-row";
import { formatDimensions, formatPixels } from "../navigation";
import type { FeedbackTone, OverlayState } from "../types";
import type { ViewHandle } from "./overview";

export interface ConfigureViewCallbacks {
  onToggleAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
  onToggleClickThrough: (enabled: boolean) => Promise<boolean>;
  onToggleEditMode: (editMode: boolean) => Promise<boolean>;
  onToggleTransparentBackground: (enabled: boolean) => Promise<boolean>;
  onPreviewOpacity: (opacity: number) => void;
  onCommitOpacity: (opacity: number) => Promise<void>;
  onSavePosition: (bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Promise<void>;
  onResetPosition: () => Promise<void>;
  onRecoverOverlay: () => Promise<void>;
  onFeedback: (message: string, tone: FeedbackTone) => void;
}

export function createConfigureView(
  initialState: OverlayState,
  callbacks: ConfigureViewCallbacks
): ViewHandle {
  const root = document.createElement("div");
  root.className = "view-stack";

  const grid = document.createElement("div");
  grid.className = "two-col-grid";

  // Coluna esquerda: Comportamento da janela
  const behaviorCard = document.createElement("section");
  behaviorCard.className = "card";
  behaviorCard.setAttribute("aria-labelledby", "behavior-heading");

  const behaviorTitle = document.createElement("h2");
  behaviorTitle.id = "behavior-heading";
  behaviorTitle.className = "card-title";
  behaviorTitle.textContent = "Comportamento da janela";

  const switchList = document.createElement("div");
  switchList.className = "switch-list";

  const swAlwaysOnTop = createSwitchRow({
    id: "cfg-always-on-top",
    title: "Sempre visível",
    description: "Mantém o chat acima de outras janelas.",
    checked: initialState.alwaysOnTop,
    onChange: async (checked, input) => {
      const ok = await callbacks.onToggleAlwaysOnTop(checked);
      if (!ok) {
        input.checked = !checked;
      }
    },
  });

  const swClickThrough = createSwitchRow({
    id: "cfg-click-through",
    title: "Permitir cliques no jogo",
    description: "O mouse atravessa a área do overlay.",
    checked: initialState.clickThrough,
    onChange: async (checked, input) => {
      const ok = await callbacks.onToggleClickThrough(checked);
      if (!ok) {
        input.checked = !checked;
      }
    },
  });

  const swEditMode = createSwitchRow({
    id: "cfg-edit-mode",
    title: "Modo edição",
    description: "Permite arrastar e redimensionar.",
    checked: initialState.editMode,
    onChange: async (checked, input) => {
      const ok = await callbacks.onToggleEditMode(checked);
      if (!ok) {
        input.checked = !checked;
      }
    },
  });

  const swTransparentBg = createSwitchRow({
    id: "cfg-transparent-bg",
    title: "Fundo transparente",
    description:
      "Remove o fundo sólido da página do chat para ver o jogo através do overlay.",
    checked: initialState.transparentBackground,
    onChange: async (checked, input) => {
      const ok = await callbacks.onToggleTransparentBackground(checked);
      if (!ok) {
        input.checked = !checked;
      }
    },
  });

  switchList.append(
    swAlwaysOnTop.element,
    swClickThrough.element,
    swEditMode.element,
    swTransparentBg.element
  );

  const opacitySection = document.createElement("div");
  opacitySection.className = "opacity-control";

  const opacityHeader = document.createElement("div");
  opacityHeader.className = "opacity-header";

  const opacityCopy = document.createElement("div");
  opacityCopy.className = "switch-row-copy";

  const opacityLabel = document.createElement("label");
  opacityLabel.className = "switch-row-title";
  opacityLabel.htmlFor = "cfg-opacity";
  opacityLabel.textContent = "Opacidade do overlay";

  const opacityDesc = document.createElement("span");
  opacityDesc.className = "switch-row-desc";
  opacityDesc.textContent =
    "Ajusta a transparência das mensagens do chat sobre o jogo.";

  opacityCopy.append(opacityLabel, opacityDesc);

  const opacityOutput = document.createElement("output");
  opacityOutput.id = "cfg-opacity-output";
  opacityOutput.htmlFor = "cfg-opacity";
  opacityOutput.className = "opacity-badge";
  opacityOutput.textContent = `${initialState.opacity}%`;

  opacityHeader.append(opacityCopy, opacityOutput);

  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.id = "cfg-opacity";
  opacitySlider.className = "toranja-slider";
  opacitySlider.min = "20";
  opacitySlider.max = "100";
  opacitySlider.step = "1";
  opacitySlider.value = String(initialState.opacity);

  const opacityScale = document.createElement("div");
  opacityScale.className = "opacity-scale";
  const scaleMin = document.createElement("span");
  scaleMin.textContent = "Mais transparente (20%)";
  const scaleMax = document.createElement("span");
  scaleMax.textContent = "Opaco (100%)";
  opacityScale.append(scaleMin, scaleMax);

  opacitySection.append(opacityHeader, opacitySlider, opacityScale);

  const posSection = document.createElement("div");
  posSection.className = "bounds-section";

  const posEyebrow = document.createElement("p");
  posEyebrow.className = "section-eyebrow";
  posEyebrow.textContent = "POSIÇÃO SALVA";

  const boundsBoxes = document.createElement("div");
  boundsBoxes.className = "bounds-boxes-grid";

  function makeNumericBox(
    id: string,
    labelText: string,
    value: number,
    unit: string
  ): { box: HTMLDivElement; input: HTMLInputElement } {
    const box = document.createElement("div");
    box.className = "metric-box";

    const label = document.createElement("label");
    label.className = "metric-box-label";
    label.htmlFor = id;
    label.textContent = labelText;

    const valueRow = document.createElement("div");
    valueRow.className = "metric-box-value-row";

    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.inputMode = "numeric";
    input.className = "metric-input";
    input.value = String(value);

    const suffix = document.createElement("span");
    suffix.className = "metric-unit";
    suffix.textContent = unit;

    valueRow.append(input, suffix);
    box.append(label, valueRow);
    return { box, input };
  }

  const boxX = makeNumericBox("cfg-pos-x", "Eixo X", initialState.savedX, "px");
  const boxY = makeNumericBox("cfg-pos-y", "Eixo Y", initialState.savedY, "px");

  const sizeBox = document.createElement("div");
  sizeBox.className = "metric-box";
  const sizeLabel = document.createElement("span");
  sizeLabel.className = "metric-box-label";
  sizeLabel.id = "cfg-size-group-label";
  sizeLabel.textContent = "Tamanho (L × A)";

  const sizeValueRow = document.createElement("div");
  sizeValueRow.className = "metric-size-row";
  sizeValueRow.setAttribute("role", "group");
  sizeValueRow.setAttribute("aria-labelledby", "cfg-size-group-label");

  const inputWidth = document.createElement("input");
  inputWidth.type = "text";
  inputWidth.id = "cfg-size-w";
  inputWidth.inputMode = "numeric";
  inputWidth.className = "metric-input metric-input-compact";
  inputWidth.setAttribute("aria-label", "Largura em pixels");
  inputWidth.value = String(initialState.savedWidth);

  const timesSep = document.createElement("span");
  timesSep.className = "metric-sep";
  timesSep.setAttribute("aria-hidden", "true");
  timesSep.textContent = "×";

  const inputHeight = document.createElement("input");
  inputHeight.type = "text";
  inputHeight.id = "cfg-size-h";
  inputHeight.inputMode = "numeric";
  inputHeight.className = "metric-input metric-input-compact";
  inputHeight.setAttribute("aria-label", "Altura em pixels");
  inputHeight.value = String(initialState.savedHeight);

  sizeValueRow.append(inputWidth, timesSep, inputHeight);
  sizeBox.append(sizeLabel, sizeValueRow);

  boundsBoxes.append(boxX.box, boxY.box, sizeBox);

  const boundsActions = document.createElement("div");
  boundsActions.className = "button-row";

  const btnSavePos = document.createElement("button");
  btnSavePos.type = "button";
  btnSavePos.className = "btn btn-primary";
  btnSavePos.textContent = "Salvar posição";

  const btnResetPos = document.createElement("button");
  btnResetPos.type = "button";
  btnResetPos.className = "btn btn-secondary";
  btnResetPos.textContent = "Restaurar padrão";

  boundsActions.append(btnSavePos, btnResetPos);
  posSection.append(posEyebrow, boundsBoxes, boundsActions);
  behaviorCard.append(behaviorTitle, switchList, opacitySection, posSection);

  // Coluna direita: Prévia do overlay + A janela sumiu?
  const rightCol = document.createElement("div");
  rightCol.className = "side-cards-stack";

  const previewCard = document.createElement("section");
  previewCard.className = "card";
  previewCard.setAttribute("aria-labelledby", "preview-heading");

  const previewTitle = document.createElement("h2");
  previewTitle.id = "preview-heading";
  previewTitle.className = "card-title";
  previewTitle.textContent = "Prévia do overlay";

  const previewSub = document.createElement("p");
  previewSub.className = "card-subtitle";
  previewSub.textContent = "Simulação de como seu chat aparece sobre o jogo.";

  const previewStage = document.createElement("div");
  previewStage.className = "preview-stage";

  const previewHeader = document.createElement("div");
  previewHeader.className = "preview-chat-header";

  const previewBadge = document.createElement("span");
  previewBadge.className = "preview-live-badge";
  previewBadge.textContent = "AO VIVO";

  const previewHeaderTitle = document.createElement("strong");
  previewHeaderTitle.className = "preview-chat-title";
  previewHeaderTitle.textContent = "Chat da transmissão";

  const previewModeTag = document.createElement("span");
  previewModeTag.className = "preview-mode-tag";

  previewHeader.append(previewBadge, previewHeaderTitle, previewModeTag);

  const previewMessages = document.createElement("ul");
  previewMessages.className = "preview-messages";

  const sampleMessages = [
    { user: "maripixel", text: "boa live! que jogo é esse?", avatarTone: "orange" },
    { user: "joaolive", text: "kkkk esse boss é difícil", avatarTone: "brown" },
    { user: "luh_streams", text: "cheguei agora, salve!", avatarTone: "coffee" },
  ] as const;

  for (const msg of sampleMessages) {
    const li = document.createElement("li");
    li.className = "preview-message-item";

    const avatar = document.createElement("span");
    avatar.className = `preview-avatar preview-avatar-${msg.avatarTone}`;
    avatar.setAttribute("aria-hidden", "true");

    const msgCopy = document.createElement("div");
    msgCopy.className = "preview-message-copy";

    const author = document.createElement("strong");
    author.className = "preview-message-author";
    author.textContent = msg.user;

    const text = document.createElement("span");
    text.className = "preview-message-text";
    text.textContent = msg.text;

    msgCopy.append(author, text);
    li.append(avatar, msgCopy);
    previewMessages.append(li);
  }

  previewStage.append(previewHeader, previewMessages);

  const previewFooter = document.createElement("p");
  previewFooter.className = "card-note";
  const previewBoundsSummary = document.createElement("p");
  previewBoundsSummary.className = "card-note";

  previewCard.append(
    previewTitle,
    previewSub,
    previewStage,
    previewFooter,
    previewBoundsSummary
  );

  // Card: A janela sumiu?
  const recoverCard = document.createElement("section");
  recoverCard.className = "card";
  recoverCard.setAttribute("aria-labelledby", "recover-heading");

  const recoverTitle = document.createElement("h2");
  recoverTitle.id = "recover-heading";
  recoverTitle.className = "card-title";
  recoverTitle.textContent = "A janela sumiu?";

  const recoverDesc = document.createElement("p");
  recoverDesc.className = "card-subtitle";
  recoverDesc.textContent =
    "Use o atalho global Ctrl + Shift + Alt + H para mostrar o overlay ou Ctrl + Shift + Alt + X para voltar ao modo edição.";

  const recoverActions = document.createElement("div");
  recoverActions.className = "button-row";

  const btnRecover = document.createElement("button");
  btnRecover.type = "button";
  btnRecover.className = "btn btn-secondary";
  btnRecover.textContent = "Recuperar overlay";

  recoverActions.append(btnRecover);
  recoverCard.append(recoverTitle, recoverDesc, recoverActions);

  rightCol.append(previewCard, recoverCard);
  grid.append(behaviorCard, rightCol);

  // Banner inferior largura total
  const banner = document.createElement("section");
  banner.className = "info-banner";
  banner.setAttribute("aria-label", "Aviso sobre tela cheia exclusiva");
  const bannerTitle = document.createElement("strong");
  bannerTitle.className = "info-banner-title";
  bannerTitle.textContent = "Funciona melhor com jogos em janela sem bordas.";
  const bannerBody = document.createElement("p");
  bannerBody.className = "info-banner-body";
  bannerBody.textContent =
    "Sobreposição em tela cheia exclusiva não é garantida pelo Windows.";
  banner.append(bannerTitle, bannerBody);

  root.append(grid, banner);

  let latestState = initialState;

  function parseBoundsInputs(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    const x = Number.parseInt(boxX.input.value.trim(), 10);
    const y = Number.parseInt(boxY.input.value.trim(), 10);
    const width = Number.parseInt(inputWidth.value.trim(), 10);
    const height = Number.parseInt(inputHeight.value.trim(), 10);

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height)
    ) {
      callbacks.onFeedback(
        "Informe números inteiros válidos para posição e tamanho (em pixels).",
        "error"
      );
      return null;
    }

    if (width < 180 || height < 140) {
      callbacks.onFeedback(
        "O tamanho mínimo do overlay é 180 × 140 px.",
        "warning"
      );
    }

    return { x, y, width, height };
  }

  btnSavePos.addEventListener("click", async () => {
    const parsed = parseBoundsInputs();
    if (!parsed) return;
    await callbacks.onSavePosition(parsed);
  });

  btnResetPos.addEventListener("click", async () => {
    await callbacks.onResetPosition();
  });

  btnRecover.addEventListener("click", async () => {
    await callbacks.onRecoverOverlay();
  });

  let opacityPreviewTimer: number | undefined;

  function syncSliderVisual(value: number, isHidden: boolean): void {
    const clamped = Math.min(100, Math.max(20, Math.round(value)));
    opacitySlider.style.setProperty("--attr-min", opacitySlider.min || "20");
    opacitySlider.style.setProperty("--attr-max", opacitySlider.max || "100");
    opacitySlider.style.setProperty("--control-value", String(clamped));
    opacitySlider.setAttribute("aria-valuetext", `${clamped}%`);
    opacityOutput.textContent = `${clamped}%`;
    const ratio = clamped / 100;
    previewStage.style.opacity = isHidden
      ? String(Math.min(0.45, ratio))
      : String(ratio);
  }

  opacitySlider.addEventListener("input", () => {
    const val = Number.parseInt(opacitySlider.value, 10);
    if (!Number.isFinite(val)) return;
    syncSliderVisual(val, latestState.running && !latestState.visible);
    window.clearTimeout(opacityPreviewTimer);
    opacityPreviewTimer = window.setTimeout(() => {
      callbacks.onPreviewOpacity(val);
    }, 45);
  });

  opacitySlider.addEventListener("change", async () => {
    window.clearTimeout(opacityPreviewTimer);
    const val = Number.parseInt(opacitySlider.value, 10);
    if (!Number.isFinite(val)) return;
    syncSliderVisual(val, latestState.running && !latestState.visible);
    await callbacks.onCommitOpacity(val);
  });

  function update(state: OverlayState, _draftUrl: string, isBusy: boolean): void {
    latestState = state;

    swAlwaysOnTop.setChecked(state.alwaysOnTop);
    swClickThrough.setChecked(state.clickThrough);
    swEditMode.setChecked(state.editMode);
    swTransparentBg.setChecked(state.transparentBackground);

    swAlwaysOnTop.setDisabled(isBusy);
    swClickThrough.setDisabled(isBusy);
    swEditMode.setDisabled(isBusy);
    swTransparentBg.setDisabled(isBusy);
    opacitySlider.disabled = isBusy;
    btnSavePos.disabled = isBusy;
    btnResetPos.disabled = isBusy;
    btnRecover.disabled = isBusy || (!state.running && !state.savedUrlConfigured);

    const isHidden = state.running && !state.visible;
    if (document.activeElement !== opacitySlider) {
      opacitySlider.value = String(state.opacity);
      syncSliderVisual(state.opacity, isHidden);
    } else {
      const activeVal = Number.parseInt(opacitySlider.value, 10);
      if (Number.isFinite(activeVal)) {
        syncSliderVisual(activeVal, isHidden);
      }
    }

    const activeX = state.running ? state.x : state.savedX;
    const activeY = state.running ? state.y : state.savedY;
    const activeW = state.running ? state.width : state.savedWidth;
    const activeH = state.running ? state.height : state.savedHeight;

    if (document.activeElement !== boxX.input) {
      boxX.input.value = String(activeX);
    }
    if (document.activeElement !== boxY.input) {
      boxY.input.value = String(activeY);
    }
    if (document.activeElement !== inputWidth) {
      inputWidth.value = String(activeW);
    }
    if (document.activeElement !== inputHeight) {
      inputHeight.value = String(activeH);
    }

    previewStage.dataset.editMode = String(state.editMode);
    previewStage.dataset.transparentBg = String(state.transparentBackground);
    previewStage.dataset.hidden = String(state.running && !state.visible);
    previewModeTag.textContent = state.editMode
      ? "EDIÇÃO"
      : state.clickThrough
        ? "FIXO"
        : "INTERATIVO";

    previewFooter.textContent = "O chat real será carregado pela sua URL.";
    previewBoundsSummary.textContent = `Geometria ativa: X ${formatPixels(activeX)} · Y ${formatPixels(activeY)} · ${formatDimensions(activeW, activeH)} px`;
  }

  update(latestState, "", false);
  return { element: root, update };
}
