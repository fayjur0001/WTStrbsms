"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useFormContext();

  const field = form.getFieldState(props.name || "");
  return (
    <div className="flex w-full">
      <input
        type={type === "password" ? (showPassword ? "text" : "password") : type}
        data-slot="input"
        className={cn(
          "file:text-foreground",
          "placeholder:text-muted-foreground",
          "selection:bg-primary",
          "selection:text-primary-foreground",
          "border-input",
          "flex",
          "h-9",
          "w-full",
          "min-w-0",
          "rounded-md",
          "border",
          "bg-transparent",
          "px-3",
          "py-1",
          "text-base",
          "shadow-xs",
          "transition-[color,box-shadow]",
          "outline-none",
          "file:inline-flex",
          "file:h-7",
          "file:border-0",
          "file:bg-transparent",
          "file:text-sm",
          "file:font-medium",
          "disabled:pointer-events-none",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",
          "md:text-sm",
          "focus-visible:border-ring",
          "focus-visible:ring-ring/50",
          "focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20",
          "aria-invalid:border-destructive",
          {
            "border-r-0 rounded-r-none": type === "password",
          },
          className,
        )}
        {...props}
      />
      {type === "password" && (
        <button
          type="button"
          className={cn(
            "border border-input border-l-0 rounded-r-md pr-3 py-1 flex",
            {
              "border-destructive text-destructive": field.invalid,
            },
          )}
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          <div
            className={cn("pr-3 border-l border-input", {
              "border-destructive": field.invalid,
            })}
          />
          {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      )}
    </div>
  );
}

export { Input };
