"use client";

import { useMutation } from "@tanstack/react-query";
import logoutAction from "./_actions/logout.action";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import socket from "@/lib/utils/socket";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Logout";
  }, []);

  const mutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: (r) => {
      if (r.success) {
        router.replace("/auth/login");
        toast.success("Logged out successfully.");
      } else {
        toast.error(r.message);
      }
    },
  });

  useEffect(() => {
    socket().emit("/auth/logout", () => {
      mutation.mutate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
