"use client";

import headerHeightAtom from "@/atoms/header-height.atom";
import { useAtomValue } from "jotai";

export default function ComingSoon() {
  const headerHeight = useAtomValue(headerHeightAtom);

  return (
    <main
      className="p-4 flex items-center justify-center"
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
    >
      <h1 className="text-2xl text-center font-bold text-primary">
        Comming Soon
      </h1>
    </main>
  );
}
