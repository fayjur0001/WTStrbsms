"use client";

import { useState } from "react";
import useTickets from "./hooks/use-tickets.hook";
import Loading from "./components/loading";
import Thead from "./components/thead";
import titlecase from "@/lib/utils/titlecase";
import TD from "./components/td";
import Pagination from "./components/pagination";

const limit = 20;

export default function OtherTickets() {
  const [page, setPage] = useState(1);

  const { tickets, isLoading, totalPages } = useTickets(page, limit);

  return (
    <div className="space-y-4">
      {!!tickets.length && (
        <h1 className="text-2xl font-semibold text-primary px-6">
          Other Tickets
        </h1>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        !!tickets.length && (
          <table className="table">
            <Thead />
            <tbody>
              {tickets.map((ticket, i) => (
                <tr key={ticket.id}>
                  <TD.Context value={{ id: ticket.id }}>
                    <TD>{(page - 1) * limit + i + 1}</TD>
                    <TD>{ticket.id}</TD>
                    <TD>{ticket.subject}</TD>
                    <TD>{ticket.username}</TD>
                    <TD>{ticket.agentname}</TD>
                    <TD>
                      {ticket.totalMessage}/{ticket.totalReadMessage}
                    </TD>
                    <TD>{titlecase(ticket.status)}</TD>
                  </TD.Context>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      <Pagination setPage={setPage} page={page} total={totalPages} />
    </div>
  );
}
