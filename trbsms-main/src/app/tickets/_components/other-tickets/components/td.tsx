import Link from "next/link";
import { createContext, ReactNode, useContext } from "react";

export default function TD({ children }: { children?: ReactNode }) {
  const { id } = useContext(TD.Context);

  return (
    <td className="text-center p-0">
      <Link className="py-3 block size-full" href={`/tickets/${id}`}>
        {children}
      </Link>
    </td>
  );
}

TD.Context = createContext({
  id: 0,
});
