"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import getSubjectAction from "./actions/get-subject.action";
import { toast } from "sonner";

export default function Subject({ ticketId }: { ticketId: number }) {
  const { subject, isLoading } = useSubject(ticketId);

  return (
    <div className="text-2xl text-white">
      {isLoading ? <div className="loading" /> : subject}
    </div>
  );
}

function useSubject(ticketId: number) {
  const [subject, setSubject] = useState("");

  const query = useQuery({
    queryKey: ["tickets", "chat", "subject", ticketId],
    queryFn: () => getSubjectAction(ticketId),
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) setSubject(query.data.subject);
    else toast.error(query.data.message);
  }, [query.data]);

  return { subject, isLoading: query.isLoading };
}
