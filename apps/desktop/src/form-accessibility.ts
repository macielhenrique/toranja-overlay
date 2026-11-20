/**
 * Synchronizes aria-invalid and aria-describedby with visual validation state
 * following the modern-web-guidance accessible-error-announcement pattern.
 */
export function linkErrorDescription(
  input: HTMLInputElement,
  shown: boolean
): void {
  const errorId = input.dataset.error;
  if (!errorId) return;

  const ids = (input.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter((id) => id && id !== errorId);

  if (shown) {
    ids.push(errorId);
  }

  if (ids.length > 0) {
    input.setAttribute("aria-describedby", ids.join(" "));
  } else {
    input.removeAttribute("aria-describedby");
  }
}

export function setFieldValidationError(
  input: HTMLInputElement,
  errorElement: HTMLElement,
  message: string | null
): void {
  if (message) {
    errorElement.textContent = message;
    input.setCustomValidity(message);
    input.classList.add("user-invalid-fallback");
    input.setAttribute("aria-invalid", "true");
    linkErrorDescription(input, true);
  } else {
    input.setCustomValidity("");
    input.classList.remove("user-invalid-fallback");
    input.setAttribute("aria-invalid", "false");
    linkErrorDescription(input, false);
  }
}
