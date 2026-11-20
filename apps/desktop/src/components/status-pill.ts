export type PillTone = "success" | "warning" | "neutral" | "error";

export interface StatusPillOptions {
  label: string;
  tone: PillTone;
  id?: string;
}

export function createStatusPill(options: StatusPillOptions): HTMLSpanElement {
  const pill = document.createElement("span");
  pill.className = "status-pill";
  pill.dataset.tone = options.tone;
  if (options.id) {
    pill.id = options.id;
  }

  const dot = document.createElement("span");
  dot.className = "status-pill-dot";
  dot.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.textContent = options.label;

  pill.append(dot, text);
  return pill;
}

export function updateStatusPill(
  pill: HTMLElement,
  label: string,
  tone: PillTone
): void {
  pill.dataset.tone = tone;
  const textNode = pill.querySelector("span:last-child");
  if (textNode) {
    textNode.textContent = label;
  }
}
