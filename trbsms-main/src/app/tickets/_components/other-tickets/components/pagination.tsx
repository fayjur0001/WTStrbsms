import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function Pagination({
  page,
  total,
  setPage,
}: {
  page: number;
  total: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  return (
    total > 1 && (
      <div className="px-4 flex justify-end items-center gap-2">
        <Button
          variant={"secondary"}
          size={"icon"}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          {page} of {total}
        </span>
        <Button
          variant={"secondary"}
          size={"icon"}
          disabled={page >= total}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    )
  );
}
