import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Card({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-background-dark p-4 rounded-md", className)}>
      {children}
    </div>
  );
}
