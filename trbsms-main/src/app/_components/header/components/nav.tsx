"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Nav() {
  return (
    <nav className="flex items-center gap-2">
      <NavButton href="/tools/receive-sms">One Time Rent</NavButton>
      <NavButton href="/tools/rent">Long Term Rent</NavButton>
      {/* <NavButton href="/tools/remote-devices">Remote Devices</NavButton>
      <NavButton href="/tools/proxy-lease">Proxy Lease</NavButton> */}
    </nav>
  );
}

function NavButton({ children, href }: { children: ReactNode; href: string }) {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Button
      variant="ghost"
      className={cn("text-primary hover:text-primary", {
        "bg-white": isActive,
      })}
      asChild
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
