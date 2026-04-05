"use client";

import { useCallback, useEffect, useState } from "react";
import Messages from "./messages/client";
import SendText from "./send-text/client";
import Subject from "./subject/client";
import ToggleTicketStatus from "./toggle-ticket-status/client";
import getTicketInfoAction, {
  Status,
} from "./actions/get-ticket-status.action";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useRefresh from "@/hooks/use-refresh";
import { useAtomValue } from "jotai";
import headerHeightAtom from "@/atoms/header-height.atom";
import Back from "./back";

export default function Client({
  ticketId,
  currentUserId,
}: {
  ticketId: number;
  currentUserId: number;
}) {
  const [cardTitleRef, setCardTitleRef] = useState<HTMLDivElement | null>(null);
  const { status, agentId, userId } = useTicketInfo(ticketId);
  const [sendTextHeight, setSendTextHeight] = useState(0);

  const headerHeight = useAtomValue(headerHeightAtom);

  const cardTitleHeight = useCallback(() => {
    return cardTitleRef?.clientHeight || 0;
  }, [cardTitleRef?.clientHeight]);

  return (
    <div className="p-6" style={{ height: `calc(100svh - ${headerHeight}px)` }}>
      <div className="h-full rounded bg-background-dark overflow-hidden">
        <div
          className="bg-primary flex px-6 py-2 gap-2 items-center justify-between"
          ref={setCardTitleRef}
        >
          <Subject ticketId={ticketId} />
          <div className="flex gap-2 items-center">
            <ToggleTicketStatus
              agentId={agentId}
              status={status}
              userId={userId}
              currentUserId={currentUserId}
              ticketId={ticketId}
            />
            <Back />
          </div>
        </div>
        <div
          className="px-6 py-2 overflow-hidden"
          style={{ height: `calc(100% - ${cardTitleHeight()}px)` }}
        >
          <div
            className="h-full overflow-y-auto"
            style={{ height: `calc(100% - ${sendTextHeight}px)` }}
          >
            <Messages scrollChange={sendTextHeight} ticketId={ticketId} />
          </div>
          <SendText
            onHeightChange={setSendTextHeight}
            agentId={agentId}
            status={status}
            userId={userId}
            currentUserId={currentUserId}
            ticketId={ticketId}
          />
        </div>
      </div>
    </div>
  );
}

function useTicketInfo(ticketId: number) {
  const [status, setStatus] = useState<Status>("closed");
  const [agentId, setAgentId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number>(0);

  const query = useQuery({
    queryFn: () => getTicketInfoAction(ticketId),
    queryKey: ["tickets", "chat", "ticket-info", ticketId],
  });

  useRefresh(`/tickets/chat/ticket-info/${ticketId}/refresh`, query.refetch);

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) {
      setStatus(query.data.status);
      setAgentId(query.data.agentId);
      setUserId(query.data.userId);
    } else toast.error(query.data.message);
  }, [query.data]);

  return { status, agentId, userId };
}
