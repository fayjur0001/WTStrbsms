"use client";

import Services from "./services/client";
import History from "./history/client";
import { useAtomValue } from "jotai";
import headerHeightAtom from "@/atoms/header-height.atom";

export default function Client({
  onlineStatusArray,
  statusArray,
}: {
  onlineStatusArray: [string, ...string[]];
  statusArray: [string, ...string[]];
}) {
  const headerHeight = useAtomValue(headerHeightAtom);

  return (
    <main
      className="p-4 space-y-4"
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
    >
      <Services />
      <History
        onlineStatusArray={onlineStatusArray}
        statusArray={statusArray}
      />
    </main>
  );
}
