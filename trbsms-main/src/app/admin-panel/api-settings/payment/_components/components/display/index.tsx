"use client";

import Link from "next/link";
import Copy from "./copy";
import { usePathname } from "next/navigation";

export default function Display({
  value,
  copy = false,
  method,
  label,
}: {
  value: string;
  copy?: boolean;
  method: string;
  label: string;
}) {
  const pathname = usePathname();
  const urlStr = `${pathname}/edit?method=${encodeURIComponent(method)}&label=${encodeURIComponent(label)}`;

  return (
    <div className="bg-background flex items-center justify-between p-2 rounded-md gap-2">
      <span>{label}</span>
      {!copy ? (
        <Link
          href={urlStr}
          className="break-all bg-primary hover:bg-primary-dark px-2 py-1 rounded-md"
        >
          {!value ? "Not Set" : value}
        </Link>
      ) : (
        <Copy>{value ? value : "Not Set"}</Copy>
      )}
    </div>
  );
}
