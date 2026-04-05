import { cn } from "@/lib/utils";
import { CSSProperties } from "react";
import { ControllerRenderProps } from "react-hook-form";

export default function Radio({
  label,
  originalValue,
  activeColor,
  ...field
}: ControllerRenderProps & {
  label: string;
  originalValue: string;
  activeColor?: string;
}) {
  const size = 12;
  return (
    <label
      className="flex items-center gap-2 cursor-pointer"
      style={
        { "--color": activeColor || "var(--color-primary)" } as CSSProperties
      }
    >
      <span className="relative flex">
        <input
          type="radio"
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-full border-3 border-white transition-all",
            { "border-[var(--color)]": field.value === originalValue },
          )}
          {...field}
          value={originalValue}
          checked={field.value === originalValue}
        />
        <span
          className={cn(
            "absolute rounded-full opacity-0 transition-opacity duration-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            { "opacity-100": field.value === originalValue },
          )}
          style={{ height: size, width: size }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 2}
              className={"stroke-[var(--color)]"}
              strokeWidth="3"
            />
          </svg>
        </span>
      </span>
      <span
        className={cn(field.value === originalValue && "text-[var(--color)]")}
      >
        {label}
      </span>
    </label>
  );
}
