import { cn } from "@/lib/utils";
import { createContext, Fragment, useContext } from "react";

export default function Highlight({ children }: { children: string }) {
  const { highlightedClass, search } = useContext(Highlight.Context);
  if (!search) return children;

  const regexp = new RegExp(search, "ig");

  const matchingParts = children.matchAll(regexp);
  const parts = children.split(regexp);

  return (
    <>
      {parts.map((part, i) => {
        const matchingPart = matchingParts.next().value;

        return (
          <Fragment key={i}>
            {part}
            {!!matchingPart && (
              <span className={cn("text-primary underline", highlightedClass)}>
                {matchingPart.at(0)}
              </span>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

Highlight.Context = createContext<{
  search: string;
  highlightedClass: string | undefined;
}>({ search: "", highlightedClass: undefined });
