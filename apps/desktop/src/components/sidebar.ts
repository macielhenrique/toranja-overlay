import toranjaSymbolOrange from "../assets/toranja-symbol-orange.svg";
import { NAV_ITEMS } from "../navigation";
import type { RouteId } from "../types";

export interface SidebarHandle {
  updateActiveRoute: (route: RouteId) => void;
}

export function mountSidebar(
  container: HTMLElement,
  initialRoute: RouteId,
  onSelectRoute: (route: RouteId) => void
): SidebarHandle {
  container.innerHTML = "";

  const brand = document.createElement("div");
  brand.className = "sidebar-brand";

  const logo = document.createElement("img");
  logo.src = toranjaSymbolOrange;
  logo.alt = "";
  logo.width = 34;
  logo.height = 38;
  logo.className = "sidebar-brand-mark";
  logo.setAttribute("aria-hidden", "true");

  const brandText = document.createElement("div");
  brandText.className = "sidebar-brand-text";

  const wordmark = document.createElement("span");
  wordmark.className = "sidebar-brand-name";
  wordmark.textContent = "toranja";

  const submark = document.createElement("span");
  submark.className = "sidebar-brand-product";
  submark.textContent = "OVERLAY";

  brandText.append(wordmark, submark);
  brand.append(logo, brandText);

  const navSection = document.createElement("div");
  navSection.className = "sidebar-nav-section";

  const navHeading = document.createElement("p");
  navHeading.className = "sidebar-section-label";
  navHeading.id = "sidebar-nav-heading";
  navHeading.textContent = "NAVEGAÇÃO";

  const nav = document.createElement("nav");
  nav.className = "sidebar-nav";
  nav.setAttribute("aria-labelledby", "sidebar-nav-heading");

  const buttons = new Map<RouteId, HTMLButtonElement>();

  for (const item of NAV_ITEMS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sidebar-nav-item";
    btn.dataset.route = item.id;
    btn.textContent = item.navLabel;
    if (item.id === initialRoute) {
      btn.setAttribute("aria-current", "page");
    }
    btn.addEventListener("click", () => {
      onSelectRoute(item.id);
    });
    buttons.set(item.id, btn);
    nav.append(btn);
  }

  navSection.append(navHeading, nav);

  const footer = document.createElement("div");
  footer.className = "sidebar-footer";

  const footerTitle = document.createElement("p");
  footerTitle.className = "sidebar-footer-title";
  footerTitle.textContent = "SEM CONTA, SEM COMPLICAÇÃO";

  const footerCopy = document.createElement("p");
  footerCopy.className = "sidebar-footer-copy";
  footerCopy.textContent = "Configurações guardadas somente neste computador.";

  footer.append(footerTitle, footerCopy);
  container.append(brand, navSection, footer);

  return {
    updateActiveRoute(route: RouteId) {
      for (const [id, btn] of buttons.entries()) {
        if (id === route) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      }
    },
  };
}
