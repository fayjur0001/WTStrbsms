import socket from "@/lib/utils/socket";
import { useEffect } from "react";

export default function useRefresh(
  link: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listener: (...args: any[]) => void,
) {
  useEffect(() => {
    socket().on(link, listener);

    return () => {
      socket().off(link);
    };
  }, [link, listener]);
}
