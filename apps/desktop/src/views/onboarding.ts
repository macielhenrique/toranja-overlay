import { setFieldValidationError } from "../form-accessibility";
import type { FeedbackTone, OverlayState } from "../types";
import { validateSocialStreamUrl } from "../url-validator";
import type { ViewHandle } from "./overview";

export interface OnboardingViewCallbacks {
  onDraftUrlChange: (value: string) => void;
  onSaveAndOpenOverlay: (normalizedUrl: string) => Promise<void>;
  onOpenSocialStreamSite: () => Promise<void>;
  onFeedback: (message: string, tone: FeedbackTone) => void;
}

export function createOnboardingView(
  initialState: OverlayState,
  initialDraftUrl: string,
  callbacks: OnboardingViewCallbacks
): ViewHandle {
  const root = document.createElement("div");
  root.className = "view-stack";

  const grid = document.createElement("div");
  grid.className = "onboarding-grid";

  // Coluna esquerda: 3 cards de passos
  const stepsCol = document.createElement("div");
  stepsCol.className = "steps-stack";

  const steps = [
    {
      eyebrow: "01 • SOCIAL STREAM NINJA",
      title: "Conecte seus chats",
      body: "Abra o Social Stream Ninja e configure as plataformas que utiliza na transmissão.",
    },
    {
      eyebrow: "02 • COPIE O LINK",
      title: "Pegue o link do overlay",
      body: "Na área de Chat, copie a URL do overlay gerada para a sua sessão.",
    },
    {
      eyebrow: "03 • PRONTO PARA JOGAR",
      title: "Cole, salve e abra",
      body: "O Toranja Overlay exibe o chat por cima do jogo e mantém os cliques liberados.",
    },
  ] as const;

  for (const step of steps) {
    const stepCard = document.createElement("article");
    stepCard.className = "card step-card";

    const eyebrow = document.createElement("p");
    eyebrow.className = "section-eyebrow";
    eyebrow.textContent = step.eyebrow;

    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = step.title;

    const body = document.createElement("p");
    body.className = "card-subtitle";
    body.textContent = step.body;

    stepCard.append(eyebrow, title, body);
    stepsCol.append(stepCard);
  }

  // Coluna direita: Configure seu overlay
  const setupCard = document.createElement("section");
  setupCard.className = "card setup-card";
  setupCard.setAttribute("aria-labelledby", "onboarding-setup-heading");

  const setupTitle = document.createElement("h2");
  setupTitle.id = "onboarding-setup-heading";
  setupTitle.className = "setup-title";
  setupTitle.textContent = "Configure seu overlay";

  const setupSubtitle = document.createElement("p");
  setupSubtitle.className = "card-subtitle";
  setupSubtitle.textContent = "Nenhuma conta precisa ser criada.";

  const form = document.createElement("form");
  form.className = "onboarding-form";
  form.noValidate = true;

  const fieldLabel = document.createElement("label");
  fieldLabel.className = "section-eyebrow field-label-eyebrow";
  fieldLabel.htmlFor = "onboarding-url-input";
  fieldLabel.textContent = "LINK DO SOCIAL STREAM NINJA";

  const input = document.createElement("input");
  input.type = "url";
  input.id = "onboarding-url-input";
  input.name = "onboardingSsnUrl";
  input.required = true;
  input.autocomplete = "off";
  input.autocapitalize = "none";
  input.spellcheck = false;
  input.placeholder = "Cole aqui o link do overlay...";
  input.setAttribute("aria-invalid", "false");
  input.dataset.error = "onboarding-url-error";
  input.value = initialDraftUrl;

  const hint = document.createElement("p");
  hint.className = "card-note";
  hint.textContent = "Aceitamos links HTTPS do Social Stream Ninja.";

  const errorEl = document.createElement("span");
  errorEl.id = "onboarding-url-error";
  errorEl.className = "error-msg";
  errorEl.textContent =
    "Informe uma URL HTTPS válida do domínio socialstream.ninja.";

  const actions = document.createElement("div");
  actions.className = "button-row onboarding-actions";

  const btnSaveAndOpen = document.createElement("button");
  btnSaveAndOpen.type = "submit";
  btnSaveAndOpen.className = "btn btn-primary";
  btnSaveAndOpen.textContent = "Salvar e abrir overlay";

  const btnOpenSite = document.createElement("button");
  btnOpenSite.type = "button";
  btnOpenSite.className = "btn btn-secondary";
  btnOpenSite.textContent = "Abrir Social Stream Ninja";

  actions.append(btnSaveAndOpen, btnOpenSite);
  form.append(fieldLabel, input, hint, errorEl, actions);

  const divider = document.createElement("hr");
  divider.className = "card-divider";

  const privacyEyebrow = document.createElement("p");
  privacyEyebrow.className = "section-eyebrow";
  privacyEyebrow.textContent = "PRIVACIDADE POR PADRÃO";

  const privacyCopy = document.createElement("p");
  privacyCopy.className = "card-note";
  privacyCopy.textContent =
    "A URL e a posição do overlay ficam salvos localmente neste computador. Você pode editar ou remover a qualquer momento.";

  setupCard.append(
    setupTitle,
    setupSubtitle,
    form,
    divider,
    privacyEyebrow,
    privacyCopy
  );

  grid.append(stepsCol, setupCard);

  const footer = document.createElement("p");
  footer.className = "onboarding-footer";
  footer.textContent =
    "Toranja Tech • Gratuito, open source e feito para simplificar sua live.";

  root.append(grid, footer);

  input.addEventListener("input", () => {
    callbacks.onDraftUrlChange(input.value);
    if (input.getAttribute("aria-invalid") === "true") {
      const check = validateSocialStreamUrl(input.value);
      if (check.valid) {
        setFieldValidationError(input, errorEl, null);
      }
    }
  });

  input.addEventListener("blur", () => {
    const trimmed = input.value.trim();
    if (trimmed.length > 0) {
      const check = validateSocialStreamUrl(trimmed);
      if (!check.valid) {
        setFieldValidationError(input, errorEl, check.reason);
      } else {
        setFieldValidationError(input, errorEl, null);
      }
    } else if (input.getAttribute("aria-invalid") === "true") {
      setFieldValidationError(input, errorEl, null);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const check = validateSocialStreamUrl(input.value);
    if (!check.valid || !check.normalizedUrl) {
      setFieldValidationError(
        input,
        errorEl,
        check.reason ?? "Informe uma URL HTTPS válida do Social Stream Ninja."
      );
      callbacks.onFeedback(
        check.reason ?? "Informe uma URL HTTPS válida do Social Stream Ninja.",
        "error"
      );
      input.focus();
      return;
    }

    setFieldValidationError(input, errorEl, null);
    await callbacks.onSaveAndOpenOverlay(check.normalizedUrl);
  });

  btnOpenSite.addEventListener("click", async () => {
    await callbacks.onOpenSocialStreamSite();
  });

  function update(_state: OverlayState, draftUrl: string, isBusy: boolean): void {
    if (document.activeElement !== input && input.value !== draftUrl) {
      input.value = draftUrl;
    }
    btnSaveAndOpen.disabled = isBusy;
    btnOpenSite.disabled = isBusy;
  }

  update(initialState, initialDraftUrl, false);
  return { element: root, update };
}
