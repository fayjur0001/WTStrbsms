"use client";

import { cn } from "@/lib/utils";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import getMessagesAction, {
  Message as TMessage,
} from "./actions/get-messages.action";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowUpToLine, User } from "lucide-react";
import useRefresh from "@/hooks/use-refresh";
import { Button } from "@/components/ui/button";

const limit = 20;

export default function Messages({
  ticketId,
  scrollChange,
}: {
  ticketId: number;
  scrollChange: number;
}) {
  const {
    pages,
    isLoading,
    newMessageRef,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    loadMore,
  } = useMessages(ticketId, scrollChange);

  return (
    <div>
      {!isLoading ? (
        <div className="space-y-4">
          {hasNextPage && !isFetching && !isLoading && !isFetchingNextPage && (
            <Button
              variant={"outline"}
              onClick={loadMore}
              className="mx-auto block"
            >
              <ArrowUpToLine />
            </Button>
          )}
          {pages.map((page, i) => (
            <div className="space-y-4 messages-chunk" key={i}>
              {page.success &&
                page.messages
                  .toReversed()
                  .map((message) => <Message key={message.id} {...message} />)}
            </div>
          ))}
          <div ref={newMessageRef} />
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function useMessages(ticketId: number, scrollChange: number) {
  const [pages, setPages] = useState<
    Awaited<ReturnType<typeof getMessagesAction>>[]
  >([]);

  const newMessageRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<SVGSVGElement | null>(null);

  const query = useInfiniteQuery({
    queryKey: ["tickets", "chat", "messages", ticketId],
    queryFn: ({ pageParam }) =>
      getMessagesAction({ ticketId, page: pageParam, limit }),
    getNextPageParam: (lastPage, allPage) => {
      if (allPage.length < ((lastPage.success && lastPage.totalPages) || 1))
        return allPage.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  // init pages
  useEffect(() => {
    if (!query.data) return;
    setPages(query.data.pages.toReversed());
  }, [query.data]);

  useEffect(() => {
    if (!newMessageRef.current) return;
    const lastPage = pages.at(-1);
    if ((pages.length === 1 && scrollChange) || !scrollChange) {
      newMessageRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    } else if (
      pages.length > 1 &&
      lastPage?.success &&
      lastPage.messages.length === limit
    ) {
      const messagesChunk = document.querySelectorAll(".messages-chunk");
      messagesChunk[1].scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    }
  }, [pages, pages.length, scrollChange]);

  useRefresh(`/tickets/chat/messages/${ticketId}/refresh`, async () => {
    await query.refetch();
  });

  async function loadMore() {
    await query.fetchNextPage();
  }

  return {
    pages,
    isLoading: query.isLoading,
    newMessageRef,
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetchingNextPage,
    loadMoreRef,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore,
  };
}

function Loading() {
  return (
    <div>
      {Array(20)
        .fill(0)
        .map((_, i) => (
          <LoadingMessage key={i} right={!(i % 2)} />
        ))}
    </div>
  );
}

function LoadingMessage({ right = false }: { right?: boolean }) {
  return (
    <div className={cn("flex gap-2", { "flex-row-reverse": right })}>
      <div className="loading size-7 rounded-full" />
      <div className={cn("flex flex-col gap-2 flex-1", { "items-end": right })}>
        <div className="loading w-[60%] md:w-[30%] h-10" />
        <div className="loading w-22 h-4" />
      </div>
    </div>
  );
}

function Message({ message, date, right }: TMessage) {
  const id = useId();

  return (
    <div className={cn("flex gap-2", { "flex-row-reverse": right })}>
      <div
        className={cn(
          "bg-white/70 text-background-dark size-7 rounded-full flex items-center justify-center",
          { "bg-primary-dark text-primary": right },
        )}
      >
        <User size={"1em"} />
      </div>
      <div
        className={cn("flex flex-col gap-2 flex-1 items-start", {
          "items-end": right,
        })}
      >
        <div className="bg-background px-4 py-2 rounded-md max-w-[60%]">
          {message
            .split("\n")
            .filter((m) => !!m.trim())
            .map((m, i) => (
              <Fragment key={`${id}-${i}`}>
                {m}
                <br />
              </Fragment>
            ))}
        </div>
        <div className="text-xs">{dateFormat(date)}</div>
      </div>
    </div>
  );
}

function dateFormat(date: Date) {
  return `${date.getFullYear().toString().padStart(4, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${(
    date.getHours() % 12 || 12
  )
    .toString()
    .padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")} ${
    date.getHours() >= 12 ? "PM" : "AM"
  }`;
}
