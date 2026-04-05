export default function getHours(unit: number, unitType: string) {
  const hour =
    unit *
    (unitType === "hour"
      ? 1
      : unitType === "day"
        ? 24
        : unitType === "week"
          ? 24 * 7
          : unitType === "month"
            ? 24 * 30
            : 0);

  return hour;
}
