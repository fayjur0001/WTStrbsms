"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Available from "./available";
import Assigned from "./assigned";

export default function Client() {
  const [currentPage, setCurrentPage] = useState<"available" | "assigned">(
    "available",
  );

  return (
    <main className="p-4 space-y-4">
      <div className="flex gap-2">
        <Button
          className="text-2xl"
          variant={currentPage === "available" ? "default" : "secondary"}
          onClick={() => setCurrentPage("available")}
        >
          Available Devices
        </Button>
        <Button
          variant={currentPage === "assigned" ? "default" : "secondary"}
          className="text-2xl"
          onClick={() => setCurrentPage("assigned")}
        >
          Assigned Devices
        </Button>
      </div>
      {currentPage === "available" ? (
        <Available onSuccess={() => setCurrentPage("assigned")} />
      ) : (
        <Assigned />
      )}
    </main>
  );
}
