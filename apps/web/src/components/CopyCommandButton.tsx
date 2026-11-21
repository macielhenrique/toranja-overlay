"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

interface CopyCommandButtonProps {
  command: string;
  label?: string;
}

function legacyCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } finally {
    field.remove();
  }
}

export function CopyCommandButton({
  command,
  label = "Copiar comando",
}: CopyCommandButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnouncementRef = useRef("");

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
        ok = true;
      } else {
        ok = legacyCopy(command);
      }
    } catch {
      ok = legacyCopy(command);
    }

    let message = ok ? "Copiado!" : "Falha ao copiar";
    if (message === lastAnnouncementRef.current) {
      message += "\u00A0";
    }
    lastAnnouncementRef.current = message;

    setStatus(ok ? "copied" : "failed");
    setAnnouncement(message);

    timerRef.current = setTimeout(() => {
      setStatus("idle");
      setAnnouncement("");
    }, 2200);
  }

  return (
    <div className="relative inline-flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        data-copied={status === "copied" ? "" : undefined}
        data-failed={status === "failed" ? "" : undefined}
        className={[
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors",
          status === "copied"
            ? "border-[#4ADE80] bg-[#4ADE80]/15 text-[#86EFAC]"
            : status === "failed"
              ? "border-[#FCA5A5] bg-[#EF4444]/15 text-[#FECACA]"
              : "border-[#4D2812] bg-[#28170B] text-[#EEDFD0] hover:border-[#F38A0F] hover:text-white",
        ].join(" ")}
      >
        {status === "copied" ? (
          <CheckIcon className="size-4 shrink-0" />
        ) : (
          <CopyIcon className="size-4 shrink-0" />
        )}
        <span>
          {status === "copied"
            ? "Copiado!"
            : status === "failed"
              ? "Erro ao copiar"
              : "Copiar"}
        </span>
      </button>

      {/* Live region kept outside the button so screen readers announce status reliably */}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
