import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export default function Cell({
  className,
  border = true,
  ...props
}: ComponentProps<"div"> & { border?: boolean }) {
  return (
    <div className={cn("p-2", className, { "border-b": border })} {...props} />
  );
}
