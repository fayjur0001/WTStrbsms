export default function Loading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Array(16)
        .fill(0)
        .map((_, i) => (
          <div className="loading h-12 rounded-full" key={i} />
        ))}
    </div>
  );
}
