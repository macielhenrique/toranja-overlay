import { createStatusPill, updateStatusPill } from "../components/status-pill";
import { createSwitchRow } from "../components/switch-row";
import type { AutomationSettingsInput, OverlayState } from "../types";
import type { ViewHandle } from "./overview";

export interface AutomationViewCallbacks {
  onUpdateAutomation: (input: AutomationSettingsInput) => Promise<boolean>;
}

export function createAutomationView(
  initialState: OverlayState,
  callbacks: AutomationViewCallbacks
): ViewHandle {
  const root = document.createElement("div");
  root.className = "view-stack";

  const grid = document.createElement("div");
  grid.className = "two-col-grid";

  // Coluna esquerda: Abertura automática
  const card = document.createElement("section");
  card.className = "card";
  card.setAttribute("aria-labelledby", "automation-heading");

  const header = document.createElement("div");
  header.className = "card-header-row";

  const headerCopy = document.createElement("div");
  const title = document.createElement("h2");
  title.id = "automation-heading";
  title.className = "card-title";
  title.textContent = "Abertura automática";
  const subtitle = document.createElement("p");
  subtitle.className = "card-subtitle";
  subtitle.textContent = "Escolha quando o Toranja Overlay deve abrir.";
  headerCopy.append(title, subtitle);

  const obsHeaderPill = createStatusPill({
    label: "OBS não detectado",
    tone: "neutral",
  });
  header.append(headerCopy, obsHeaderPill);

  let latestState = initialState;

  async function commitAutomation(
    patch: Partial<AutomationSettingsInput>
  ): Promise<boolean> {
    return callbacks.onUpdateAutomation({
      autoOpenWithObs: patch.autoOpenWithObs ?? latestState.autoOpenWithObs,
      restoreLastPosition:
        patch.restoreLastPosition ?? latestState.restoreLastPosition,
      launchOnWindowsStartup:
        patch.launchOnWindowsStartup ?? latestState.launchOnWindowsStartup,
      startPinned: patch.startPinned ?? latestState.startPinned,
    });
  }

  const switchList = document.createElement("div");
  switchList.className = "switch-list";

  const swAutoObs = createSwitchRow({
    id: "auto-open-obs",
    title: "Abrir quando o OBS iniciar",
    description: "Detecta o OBS aberto no Windows e exibe o overlay.",
    checked: initialState.autoOpenWithObs,
    onChange: async (checked, input) => {
      const ok = await commitAutomation({ autoOpenWithObs: checked });
      if (!ok) input.checked = !checked;
    },
  });

  const swRestorePos = createSwitchRow({
    id: "auto-restore-position",
    title: "Restaurar a última posição",
    description: "Retorna ao mesmo monitor, tamanho e posição.",
    checked: initialState.restoreLastPosition,
    onChange: async (checked, input) => {
      const ok = await commitAutomation({ restoreLastPosition: checked });
      if (!ok) input.checked = !checked;
    },
  });

  const swWinStartup = createSwitchRow({
    id: "auto-windows-startup",
    title: "Iniciar com o Windows",
    description: "Abre o aplicativo em segundo plano ao ligar o PC.",
    checked: initialState.launchOnWindowsStartup,
    onChange: async (checked, input) => {
      const ok = await commitAutomation({ launchOnWindowsStartup: checked });
      if (!ok) input.checked = !checked;
    },
  });

  const swStartPinned = createSwitchRow({
    id: "auto-start-pinned",
    title: "Iniciar em modo fixo",
    description: "Mantém a passagem de cliques ativada.",
    checked: initialState.startPinned,
    onChange: async (checked, input) => {
      const ok = await commitAutomation({ startPinned: checked });
      if (!ok) input.checked = !checked;
    },
  });

  switchList.append(
    swAutoObs.element,
    swRestorePos.element,
    swWinStartup.element,
    swStartPinned.element
  );

  const cardNote = document.createElement("p");
  cardNote.className = "card-note";
  cardNote.textContent =
    "Se o OBS já estiver aberto, o aplicativo poderá iniciar o overlay assim que detectar o processo.";

  card.append(header, switchList, cardNote);

  // Coluna direita: Monitoramento + Tudo fica no seu computador
  const rightCol = document.createElement("div");
  rightCol.className = "side-cards-stack";

  const monitorCard = document.createElement("section");
  monitorCard.className = "card";
  monitorCard.setAttribute("aria-labelledby", "monitor-heading");

  const monitorEyebrow = document.createElement("p");
  monitorEyebrow.className = "section-eyebrow";
  monitorEyebrow.textContent = "MONITORAMENTO";

  const monitorTitle = document.createElement("h2");
  monitorTitle.id = "monitor-heading";
  monitorTitle.className = "monitor-title";
  monitorTitle.textContent = "OBS Studio";

  const monitorPill = createStatusPill({
    label: "Aguardando OBS",
    tone: "neutral",
  });

  const monitorDivider = document.createElement("hr");
  monitorDivider.className = "card-divider";

  const monitorLead = document.createElement("strong");
  monitorLead.className = "monitor-lead";
  monitorLead.textContent = "Ao detectar o OBS, o chat abre automaticamente.";

  const monitorDesc = document.createElement("p");
  monitorDesc.className = "card-note";
  monitorDesc.textContent =
    "Disponível no aplicativo para Windows. Não exige plugin do OBS nem configuração extra.";

  const monitorWarning = document.createElement("p");
  monitorWarning.className = "card-warning";
  monitorWarning.hidden = true;

  monitorCard.append(
    monitorEyebrow,
    monitorTitle,
    monitorPill,
    monitorDivider,
    monitorLead,
    monitorDesc,
    monitorWarning
  );

  const localCard = document.createElement("section");
  localCard.className = "card";
  localCard.setAttribute("aria-labelledby", "local-privacy-heading");

  const localTitle = document.createElement("h2");
  localTitle.id = "local-privacy-heading";
  localTitle.className = "card-title";
  localTitle.textContent = "Tudo fica no seu computador";

  const localDesc = document.createElement("p");
  localDesc.className = "card-subtitle";
  localDesc.textContent =
    "Sem login, sem servidor da Toranja Tech e sem enviar sua URL para fora do seu PC.";

  localCard.append(localTitle, localDesc);
  rightCol.append(monitorCard, localCard);
  grid.append(card, rightCol);

  // Banner inferior
  const banner = document.createElement("section");
  banner.className = "info-banner";
  banner.setAttribute("aria-label", "Diferença entre automação OBS e inicialização Windows");
  const bannerTitle = document.createElement("strong");
  bannerTitle.className = "info-banner-title";
  bannerTitle.textContent =
    "Abrir com o OBS e iniciar com o Windows são configurações diferentes.";
  const bannerBody = document.createElement("p");
  bannerBody.className = "info-banner-body";
  bannerBody.textContent =
    "O aplicativo precisa estar ativo em segundo plano para detectar o OBS quando essa automação estiver ligada.";
  banner.append(bannerTitle, bannerBody);

  root.append(grid, banner);

  function update(state: OverlayState, _draftUrl: string, isBusy: boolean): void {
    latestState = state;

    swAutoObs.setChecked(state.autoOpenWithObs);
    swRestorePos.setChecked(state.restoreLastPosition);
    swWinStartup.setChecked(state.launchOnWindowsStartup);
    swStartPinned.setChecked(state.startPinned);

    swAutoObs.setDisabled(isBusy);
    swRestorePos.setDisabled(isBusy);
    swWinStartup.setDisabled(isBusy);
    swStartPinned.setDisabled(isBusy);

    if (state.obsDetected) {
      updateStatusPill(obsHeaderPill, "OBS detectado", "success");
      updateStatusPill(monitorPill, "OBS em execução", "success");
    } else if (!state.obsMonitoringActive) {
      updateStatusPill(obsHeaderPill, "Monitor inativo", "neutral");
      updateStatusPill(monitorPill, "Apenas no Windows", "neutral");
    } else {
      updateStatusPill(obsHeaderPill, "OBS não detectado", "neutral");
      updateStatusPill(monitorPill, "Aguardando OBS", "neutral");
    }

    if (state.autoOpenWithObs && !state.savedUrlConfigured) {
      monitorWarning.hidden = false;
      monitorWarning.textContent =
        "Salve um link do Social Stream Ninja para que o overlay possa abrir quando o OBS iniciar.";
    } else {
      monitorWarning.hidden = true;
    }
  }

  update(initialState, "", false);
  return { element: root, update };
}
