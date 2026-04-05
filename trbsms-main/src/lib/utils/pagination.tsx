"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  totalPage,
  page,
  onChangeAction: change,
}: {
  totalPage: number;
  page: number;
  onChangeAction: (page: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Button
          className="size-7"
          size={"icon"}
          onClick={() => change(page - 1)}
          variant={"ghost"}
        >
          <ChevronLeft />
        </Button>
      )}
      {Array(Math.min(10, totalPage))
        .fill(0)
        .map((_, i) => {
          const half = Math.min(5, Math.floor(totalPage / 2));

          let start = 1;
          if (page < half || totalPage < 10) {
            start = 1;
          } else if (page + half > totalPage) {
            start = totalPage - 9;
          } else {
            start = page - half + 1;
          }

          const currentPage = start + i;
          return (
            <Button
              key={i}
              variant={page === currentPage ? "default" : "ghost"}
              className="size-7"
              size={"icon"}
              onClick={() => page !== currentPage && change(currentPage)}
            >
              {currentPage}
            </Button>
          );
        })}
      {page < totalPage && (
        <Button
          className="size-7"
          size={"icon"}
          onClick={() => change(page + 1)}
          variant={"ghost"}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}
