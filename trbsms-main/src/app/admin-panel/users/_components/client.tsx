"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import getUsersAction, { User } from "./actions/get-users.action";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import titlecase from "@/lib/utils/titlecase";
import dateFormat from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";
import useRefresh from "@/hooks/use-refresh";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  ShieldUser,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ToggleBanUser from "./components/toggle-ban-user/client";
import TemporaryBan from "./components/temporary-ban/client";
import Filter from "./components/filter";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Role from "@/types/role.type";
import { zodResolver } from "@hookform/resolvers/zod";
import getSchema from "./schemas/filter.schema";
import LoginAs from "./components/login-as/client";
import VerifyPinCode from "./components/verify-pin-code";

const limit = 20;

export default function Client({ roles }: { roles: (Role | "all")[] }) {
  const [page, setPage] = useState(1);
  const queryKey = ["admin-panel", "users", String(page)];
  const {
    form,
    search,
    reset,
    isLoading: isSearchLoading,
  } = useSearch({ roles, queryKey, setPage });

  const { users, totalPages, isLoading } = useUsers({
    filter: form.watch(),
    page,
    queryKey,
  });

  return (
    <div className="space-y-4">
      <form onSubmit={search}>
        <Form {...form}>
          <Filter
            roles={roles}
            control={form.control}
            onReset={reset}
            isLoading={isSearchLoading}
          />
        </Form>
      </form>
      {isLoading || isSearchLoading ? (
        <Loading />
      ) : (
        <>
          {!!users.length ? (
            <table className="table">
              <Thead />
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id}>
                    <td className="text-center">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="text-center">{user.username}</td>
                    <td className="text-center">{titlecase(user.role)}</td>
                    <td className="text-center">{user.email}</td>
                    <td className="text-center w-0">
                      <div className="flex items-center justify-center">
                        <div
                          className={cn("size-2 rounded-full bg-red-500", {
                            "bg-green-500": user.isOnline,
                          })}
                        />
                      </div>
                    </td>
                    <td className="text-center">{dateFormat(user.activity)}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              className="bg-background-dark rounded-full"
                              asChild
                            >
                              <Link
                                href={`/admin-panel/users/change-role/${user.id}`}
                              >
                                <ShieldUser />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Change Role</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="bg-background-dark rounded-full"
                              type="button"
                              size={"icon"}
                              asChild
                            >
                              <Link href={`/admin-panel/users/edit/${user.id}`}>
                                <SquarePen />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit User Information</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="bg-background-dark rounded-full"
                              type="button"
                              size="icon"
                              asChild
                            >
                              <Link
                                href={`/admin-panel/users/change-password/${user.id}`}
                              >
                                <KeyRound />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Change Password</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <VerifyPinCode id={user.id} username={user.username} />
                        <ToggleBanUser
                          banned={user.banned}
                          id={user.id}
                          username={user.username}
                        />
                        {!user.banned && (
                          <TemporaryBan id={user.id} username={user.username} />
                        )}
                        {!user.banned && (
                          <LoginAs id={user.id} username={user.username} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No user found</p>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 justify-end">
              <Button
                size={"icon"}
                variant={"secondary"}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
              </Button>
              {page}/{totalPages}
              <Button
                size={"icon"}
                variant={"secondary"}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function useUsers({
  filter,
  page,
  queryKey,
}: {
  filter: unknown;
  queryKey: string[];
  page: number;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery({
    queryKey,
    queryFn: () => getUsersAction({ limit, page, filter }),
    staleTime: 0,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.data.success) {
      setUsers(query.data.users);
      setTotalPages(query.data.totalPages);
    } else toast.error(query.data.message);
  }, [query.data]);

  useRefresh(
    "/admin-panel/users",
    ({ action, id }: { action: "update" | "new"; id: number }) => {
      if (action === "update" && users.some((user) => user.id === id))
        query.refetch();
      else if (action === "new" && page === 1) query.refetch();
    },
  );

  return {
    users,
    totalPages,
    isLoading: query.isLoading,
  };
}

function Loading() {
  return (
    <table className="table">
      <Thead />
      <tbody>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              {Array(8)
                .fill(0)
                .map((_, j) => (
                  <td key={`${i}-${j}`}>
                    <div className="loading" />
                  </td>
                ))}
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
        <th className="text-center">#</th>
        <th className="text-center">Username</th>
        <th className="text-center">Role</th>
        <th className="text-center">Email</th>
        <th className="text-center">Status</th>
        <th className="text-center">Activity</th>
        <th className="text-center">Settings</th>
        <th className="text-center">Action</th>
      </tr>
    </thead>
  );
}

function useSearch({
  queryKey,
  roles,
  setPage,
}: {
  roles: (Role | "all")[];
  queryKey: string[];
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const client = useQueryClient();

  const schema = getSchema(roles as [string, ...string[]]);

  const form = useForm({
    defaultValues: {
      role: "all",
      username: "",
      email: "",
      bannedOnly: false,
      onlineOnly: false,
    },
    resolver: zodResolver(schema),
  });

  const search = form.handleSubmit(async () => {
    setPage(1);
    setIsLoading(true);
    await client.invalidateQueries({ queryKey });
    setIsLoading(false);
  });

  function reset() {
    form.reset();
    search();
  }

  return { form, search, reset, isLoading };
}
