import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

export default function Filter({
  control,
  serviceCount,
  // searchResults,
}: {
  control: UseFormReturn["control"];
  serviceCount: number;
  // searchResults: ReactNode;
}) {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-end gap-2 relative">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input
                {...field}
                placeholder={`Search from our ${serviceCount} services`}
                className="w-full border-primary placeholder:text-primary text-primary rounded-full"
                // onFocus={() => setIsOpen(true)}
                // onBlur={() => setTimeout(() => setIsOpen(false), 300)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* {isOpen && ( */}
      {/*   <div className="absolute top-[calc(100%+10px)] w-full bg-background rounded-md overflow-hidden"> */}
      {/*     {searchResults} */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
}
