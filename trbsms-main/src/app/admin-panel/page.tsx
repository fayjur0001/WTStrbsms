import { redirect } from "next/navigation";

export default function AdminPanel() {
  return redirect("/admin-panel/users");
}
