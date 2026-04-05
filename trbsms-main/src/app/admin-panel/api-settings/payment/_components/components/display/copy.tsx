"use client";

import { toast } from "sonner";

export default function Copy({ children }: { children: string }) {
  function onClick() {
    navigator.clipboard.writeText(children.toString());
    toast.success("Copied to clipboard");
  }

  return (
    <button
      onClick={onClick}
      className="break-all bg-primary hover:bg-primary-dark px-2 py-1 rounded-md text-left"
    >
      {children}
    </button>
  );
}
