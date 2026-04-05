export default function RemainingTime({
  createdAt,
  currentDate,
  limit,
}: {
  createdAt: Date;
  currentDate?: Date;
  limit: number;
}) {
  return (
    currentDate && (
      <span>
        {formatTime(createdAt.getTime() + limit - currentDate.getTime())}
      </span>
    )
  );
}

function formatTime(t: number): string {
  t = t / 1000;

  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);

  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
