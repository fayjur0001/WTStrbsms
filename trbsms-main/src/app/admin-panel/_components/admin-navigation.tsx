"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Role from "@/types/role.type";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Single = {
  name: string;
  slug: string;
  role?: Role | Role[];
};

type Group = Single & {
  childrens: Single[];
  type: "group";
};

type Menu = (Single & { type: "single" }) | Group;

const menus: Menu[] = [
  {
    name: "All Users",
    slug: "users",
    type: "single",
  },
  {
    name: "Transactions",
    slug: "transactions",
    type: "single",
    role: "super admin",
  },
  {
    name: "Api Settings",
    type: "group",
    slug: "api-settings",
    role: ["super admin"],
    childrens: [
      {
        name: "Payment",
        slug: "payment",
      },
      {
        name: "Provider",
        slug: "provider",
      },
    ],
  },
  {
    name: "General",
    slug: "general",
    type: "group",
    childrens: [
      // {
      //   name: "Site Title",
      //   slug: "site-title",
      // },
      {
        name: "Site Mode",
        slug: "site-mode",
      },
      {
        name: "Notice",
        slug: "notice",
      },
      {
        name: "TOS",
        slug: "terms-of-service",
      },
    ],
  },
];

export default function AdminNavigation({ role }: { role: Role }) {
  return (
    <div className="p-4 pr-0">
      <div
        className={cn("bg-background-dark", "rounded-md", "p-4", "space-y-4")}
      >
        <Button
          variant={"ghost"}
          className={cn(
            "text-primary",
            "text-lg",
            "font-bold",
            "hover:bg-transparent",
            "hover:text-primary",
          )}
          tabIndex={-1}
        >
          Admin
        </Button>
        <div className="space-y-2">
          {menus.map((menu) => {
            if (
              menu.role &&
              ((typeof menu.role === "string" && menu.role !== role) ||
                !menu.role?.includes(role))
            )
              return;

            if (menu.type === "group")
              return (
                <NavGroup
                  name={menu.name}
                  key={menu.slug}
                  childrens={menu.childrens}
                  slug={menu.slug}
                  role={role}
                />
              );

            return (
              <NavItem key={menu.slug} slug={menu.slug} name={menu.name} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NavGroup({
  name,
  childrens,
  slug,
  role,
}: {
  name: string;
  childrens: Single[];
  slug: string;
  role: Role;
}) {
  const pathname = usePathname();

  const isActive = pathname.startsWith(`/admin-panel/${slug}`);

  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <Collapsible className="space-y-2" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn(
            "flex",
            "w-full",
            "text-left",
            "hover:bg-background",
            "hover:text-primary",
            "justify-start",
            "items-center",
            "leading-7.5",
            {
              "bg-background text-primary": isOpen,
            },
          )}
        >
          {name} {isOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ml-4", "space-y-2")}>
        {childrens.map((children) => {
          if (
            children.role &&
            ((typeof children.role === "string" && children.role !== role) ||
              !children.role?.includes(role))
          )
            return;

          return (
            <NavItem
              key={`${slug}/${children.slug}`}
              slug={`${slug}/${children.slug}`}
              name={children.name}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavItem({ name, slug }: { name: string; slug: string }) {
  const pathname = usePathname();

  const location = `/admin-panel/${slug}`;
  const isActive = pathname.startsWith(location);

  return (
    <Button
      variant={"ghost"}
      key={slug}
      size={"sm"}
      asChild
      className={cn(
        "block",
        "w-full",
        "text-left",
        "hover:bg-background",
        "hover:text-primary",
        "items-center",
        {
          "bg-background text-primary": isActive,
        },
      )}
    >
      <Link className="leading-7.5" href={location}>
        {name}
      </Link>
    </Button>
  );
}
