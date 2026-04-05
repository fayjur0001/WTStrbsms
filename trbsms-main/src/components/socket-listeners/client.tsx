"use client";

import useRefresh from "@/hooks/use-refresh";

export default function SocketListeners() {
  useRefresh("", () => {});

  return null;
}
