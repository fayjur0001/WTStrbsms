export default function dateFormat(
  date: Date,
  options?: { dateOnly?: boolean; timeOnly?: boolean },
): string {
  const formatedDate = `${date.getFullYear().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  if (options?.dateOnly) {
    return formatedDate;
  }

  const fotmatedTime = `${(date.getHours() % 12 || 12).toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;

  if (options?.timeOnly) {
    return fotmatedTime;
  }

  return `${formatedDate} ${fotmatedTime}`;
}
