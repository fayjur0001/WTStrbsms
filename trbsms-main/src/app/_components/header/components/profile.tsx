"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import titlecase from "@/lib/utils/titlecase";
import Role from "@/types/role.type";
import { ChevronDown, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Menu = {
  name: string;
  location: string;
  role?: Role[] | Role;
};

const menus: Menu[] = [
  {
    name: "Admin Panel",
    location: "/admin-panel",
    role: ["admin", "super admin"],
  },
  {
    name: "Profile",
    location: "/profile",
  },
  {
    name: "Logout",
    location: "/auth/logout",
  },
];

export default function Profile({
  username,
  role,
}: {
  username: string;
  role: Role;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className="hover:bg-background rounded-full hover:text-primary-dark text-primary"
        >
          <CircleUserRound className="size-7" />
          <ChevronDown className="size-4 -ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <Button
          tabIndex={-1}
          variant={"ghost"}
          className="hover:bg-transparent hover:text-white"
        >
          Hello, <span className="text-primary">{titlecase(username)}</span>
        </Button>
        {menus
          .filter((menu) => {
            if (!menu.role) return true;
            if (menu.role.includes(role)) return true;
            return false;
          })
          .map((menu) => (
            <Button
              key={menu.name}
              className="block hover:bg-background hover:text-white"
              variant="ghost"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={menu.location}>{menu.name}</Link>
            </Button>
          ))}
      </PopoverContent>
    </Popover>
  );
}
