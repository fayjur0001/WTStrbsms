"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster", "group")}
      style={
        {
          "--normal-bg": "var(--primary)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--primary-dark)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
