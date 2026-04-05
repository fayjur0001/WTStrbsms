"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function LocalLink({
  href,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      href={href.startsWith("/") ? href : `${pathname}/${href}`}
    />
  );
}
