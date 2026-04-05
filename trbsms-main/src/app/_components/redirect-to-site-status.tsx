"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Role from "@/types/role.type";
import staffPassPhase from "@/lib/utils/staff-pass-phase";

export default function RedirectToSiteStatus({
  mode,
  role,
  shadowAdmin,
}: {
  role?: Role;
  mode: string;
  shadowAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mode === "production") return;

    if (!!role && ["admin", "super admin"].includes(role)) return;

    if (shadowAdmin) return;

    if (!!role && pathname !== "/auth/logout")
      return router.push("/auth/logout");

    if (!["/site-status", `/auth/login/${staffPassPhase}`].includes(pathname))
      router.push("/site-status");
  }, [mode, pathname, role, router, shadowAdmin]);

  return null;
}
