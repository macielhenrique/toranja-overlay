import "./editor.css";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

type ResizeDirection = Parameters<
  ReturnType<typeof getCurrentWindow>["startResizeDragging"]
>[0];

const appWindow = getCurrentWindow();
const btnPin = document.querySelector<HTMLButtonElement>("#btn-pin-overlay");
let isPinning = false;

async function pinOverlay(): Promise<void> {
  if (isPinning) {
    return;
  }
  isPinning = true;
  if (btnPin) {
    btnPin.disabled = true;
  }
  try {
    await invoke("set_overlay_edit_mode", { editMode: false });
  } catch {
    isPinning = false;
    if (btnPin) {
      btnPin.disabled = false;
    }
  }
}

document.addEventListener("mousedown", (event) => {
  if (event.button !== 0) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.closest("#btn-pin-overlay")) {
    return;
  }

  const resizeHandle = target.closest<HTMLElement>("[data-resize]");
  if (resizeHandle) {
    const direction = resizeHandle.dataset.resize as ResizeDirection | undefined;
    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      void appWindow.startResizeDragging(direction);
    }
    return;
  }

  if (target.closest("[data-drag-surface]")) {
    event.preventDefault();
    void appWindow.startDragging();
  }
});

btnPin?.addEventListener("click", () => {
  void pinOverlay();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    void pinOverlay();
  }
});
