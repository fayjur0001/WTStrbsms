import { useEffect, useState } from "react";
import getMessagesAction from "./actions/get-messages.action";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import dateFormat from "@/lib/utils/date-format";

type Message = Extract<
  Awaited<ReturnType<typeof getMessagesAction>>,
  { success: true }
>["messages"][number];

export default function Messages({ id }: { id: number }) {
  const { messages } = useMessages(id);

  return (
    <table className="table">
      <Thead />
      <tbody>
        {messages.map((message, i) => (
          <tr key={message.id}>
            <td className="text-center">{i + 1}</td>
            <td className="text-center">
              {dateFormat(new Date(message.date))}
            </td>
            <td className="text-center">{message.from}</td>
            <td className="text-center">{message.reply}</td>
            <td className="text-center">{message.pin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Thead() {
  return (
    <thead>
      <tr>
        <th className="text-center w-0">#</th>
        <th className="text-center">Time</th>
        <th className="text-center">From</th>
        <th className="text-center">Message</th>
        <th className="text-center">Pin</th>
      </tr>
    </thead>
  );
}

function useMessages(id: number) {
  const [messages, setMessages] = useState<Message[]>([]);

  const query = useQuery({
    queryKey: ["tools", "rent", "history", id, "messages"],
    queryFn: () => getMessagesAction(id),
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (!query.data) return;

    if (query.data.success) setMessages(query.data.messages);
    else toast.error(query.data.message);
  }, [query.data]);

  return {
    messages,
  };
}
