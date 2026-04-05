import { ReactNode } from "react";
import AdminNavigation from "./_components/admin-navigation";
import getAuth from "@/lib/utils/auth";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const auth = getAuth();
  const payload = await auth.getNullablePayload();

  return (
    <div className="flex items-stretch">
      {!!payload && <AdminNavigation role={payload.role} />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
