import getServicesAction from "../actions/get-services.action";

type Service = Extract<
  Awaited<ReturnType<typeof getServicesAction>>,
  { success: true }
>["services"][number];

export default function SearchResults({
  filteredServices: services,
  onClick: click,
}: {
  filteredServices: Service[];
  onClick: (value: string) => void;
}) {
  return (
    <div className="max-h-150 overflow-y-auto">
      {services.map((service) => (
        <button
          key={service.name}
          className="block w-full text-left hover:bg-background-dark px-4 py-2"
          onClick={() => click(service.name)}
          type="button"
        >
          {service.name}
        </button>
      ))}
    </div>
  );
}
