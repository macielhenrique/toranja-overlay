export interface SwitchRowOptions {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean, input: HTMLInputElement) => Promise<void> | void;
}

export interface SwitchRowHandle {
  element: HTMLDivElement;
  input: HTMLInputElement;
  setChecked: (checked: boolean) => void;
  setDisabled: (disabled: boolean) => void;
}

export function createSwitchRow(options: SwitchRowOptions): SwitchRowHandle {
  const row = document.createElement("div");
  row.className = "switch-row";

  const label = document.createElement("label");
  label.className = "switch-row-label";
  label.htmlFor = options.id;

  const copy = document.createElement("span");
  copy.className = "switch-row-copy";

  const title = document.createElement("strong");
  title.className = "switch-row-title";
  title.textContent = options.title;

  const desc = document.createElement("span");
  desc.className = "switch-row-desc";
  desc.textContent = options.description;

  copy.append(title, desc);

  const input = document.createElement("input");
  input.id = options.id;
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.className = "toranja-switch";
  input.checked = options.checked;
  input.disabled = Boolean(options.disabled);

  input.addEventListener("change", () => {
    void options.onChange(input.checked, input);
  });

  label.append(copy, input);
  row.append(label);

  return {
    element: row,
    input,
    setChecked(checked: boolean) {
      input.checked = checked;
    },
    setDisabled(disabled: boolean) {
      input.disabled = disabled;
    },
  };
}
