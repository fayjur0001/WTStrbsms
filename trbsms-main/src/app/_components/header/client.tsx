"use client";

// import SiteName from "./components/site-name/client";
import Balance from "./components/balance/client";
import Profile from "./components/profile";
import Role from "@/types/role.type";
import Nav from "./components/nav";
import { useCallback, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import headerHeightAtom from "@/atoms/header-height.atom";
import Logo from "./components/logo";

export default function Header({
  username,
  role,
}: {
  username: string;
  role: Role;
}) {
  const [ref, setRef] = useState<HTMLHeadElement | null>(null);
  const setHeight = useSetAtom(headerHeightAtom);

  const getHeight = useCallback(() => {
    if (!ref) return 0;

    return ref.clientHeight;
  }, [ref]);

  useEffect(() => {
    setHeight(getHeight());
  }, [getHeight, setHeight]);

  return (
    <header
      ref={setRef}
      className="bg-background-dark p-4 flex justify-between items-center"
    >
      {/* <SiteName onUpdate={() => setHeight(getHeight())} /> */}
      <Logo />
      <Nav />
      <div className="flex gap-1 items-center">
        <Profile username={username} role={role} />
        <Balance onUpdate={() => setHeight(getHeight())} />
      </div>
    </header>
  );
}
