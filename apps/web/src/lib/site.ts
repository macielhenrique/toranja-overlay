export const SITE = {
  name: "Toranja Overlay",
  brand: "Toranja Tech",
  version: "0.1.0",
  installerFileName: "Toranja-Overlay-0.1.0-x64-setup.exe",
  portableFileName: "Toranja-Overlay-0.1.0-x64-portable.zip",
  installerUrl:
    "https://github.com/macielhenrique/toranja-overlay/releases/download/v0.1.0/Toranja-Overlay-0.1.0-x64-setup.exe",
  portableUrl:
    "https://github.com/macielhenrique/toranja-overlay/releases/download/v0.1.0/Toranja-Overlay-0.1.0-x64-portable.zip",
  githubUrl: "https://github.com/macielhenrique/toranja-overlay",
  licenseUrl: "https://github.com/macielhenrique/toranja-overlay/blob/main/LICENSE",
  releasesUrl: "https://github.com/macielhenrique/toranja-overlay/releases",
  chocolateyCommand: "choco install toranja-overlay",
  chocolateyPackageUrl: "https://community.chocolatey.org/packages/toranja-overlay",
  socialStreamNinjaUrl: "https://socialstream.ninja/",
} as const;

export const NAV_ITEMS = [
  { href: "#por-que", label: "Por que existe" },
  { href: "#recursos", label: "Recursos" },
  { href: "#como-usar", label: "Como usar" },
  { href: "#instalar", label: "Instalar" },
  { href: "#faq", label: "FAQ" },
] as const;
