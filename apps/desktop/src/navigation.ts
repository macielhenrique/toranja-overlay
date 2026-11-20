import type { HeroStatusCopy, OverlayState, RouteId } from "./types";

export interface NavItem {
  id: RouteId;
  navLabel: string;
  pageTitle: string;
  pageSubtitle: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: "overview",
    navLabel: "Visão geral",
    pageTitle: "Visão geral",
    pageSubtitle: "Seu chat na tela, enquanto o jogo continua.",
  },
  {
    id: "configure",
    navLabel: "Configurar overlay",
    pageTitle: "Configurar overlay",
    pageSubtitle: "Ajuste a janela para ficar exatamente onde você precisa.",
  },
  {
    id: "automation",
    navLabel: "Automação e OBS",
    pageTitle: "Automação e OBS",
    pageSubtitle: "Seu overlay pronto para quando a transmissão começar.",
  },
  {
    id: "onboarding",
    navLabel: "Como começar",
    pageTitle: "Primeira configuração",
    pageSubtitle: "Três passos para colocar seu chat na tela.",
  },
] as const;

export function getNavItem(route: RouteId): NavItem {
  return NAV_ITEMS.find((item) => item.id === route) ?? NAV_ITEMS[0];
}

export function resolveInitialRoute(
  state: Pick<OverlayState, "savedUrlConfigured" | "onboardingCompleted">
): RouteId {
  if (!state.savedUrlConfigured && !state.onboardingCompleted) {
    return "onboarding";
  }
  return "overview";
}

export function formatPixels(value: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(Math.round(value))} px`;
}

export function formatDimensions(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)}`;
}

export function getHeroStatusCopy(state: OverlayState): HeroStatusCopy {
  if (!state.running) {
    return {
      eyebrow: "OVERLAY DESCONECTADO",
      title: state.savedUrlConfigured ? "Pronto para iniciar" : "Configure seu link",
      detail: state.savedUrlConfigured
        ? "Clique em Iniciar overlay para exibir o chat sobre o jogo."
        : "Cole a URL do Social Stream Ninja abaixo ou acesse Como começar.",
      isLive: false,
    };
  }

  if (!state.visible) {
    return {
      eyebrow: "OVERLAY OCULTO",
      title: "Janela oculta",
      detail: "Use Mostrar overlay ou Ctrl + Shift + Alt + H para exibir.",
      isLive: false,
    };
  }

  if (state.editMode) {
    return {
      eyebrow: "OVERLAY EM EXECUÇÃO",
      title: "Modo edição",
      detail: "Arraste e redimensione a janela na tela.",
      isLive: true,
    };
  }

  return {
    eyebrow: "OVERLAY EM EXECUÇÃO",
    title: state.clickThrough ? "Janela fixa" : "Janela interativa",
    detail: state.clickThrough
      ? "Cliques passam para o jogo"
      : "Cliques são capturados pelo chat",
    isLive: true,
  };
}
