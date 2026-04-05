"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Back() {
  const router = useRouter();

  function click() {
    router.back();
  }

  return (
    <Button variant="secondary" onClick={click}>
      Back
    </Button>
  );
}
