import { Metadata } from "next";
import Client from "../_components/client";
import getAuth from "@/lib/utils/auth";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import staffPassPhase from "@/lib/utils/staff-pass-phase";

export const metadata: Metadata = {
  title: "Staff Signin",
};

const paramsSchema = z.object({
  staffPassPhrase: z.string().min(1),
});

type Props = {
  params: Promise<unknown>;
};

export default async function Page(props: Props) {
  const auth = getAuth();

  if (!(await auth.verify())) return redirect("/");

  let params: z.infer<typeof paramsSchema>;
  try {
    params = paramsSchema.parse(await props.params);
  } catch {
    return notFound();
  }

  if (staffPassPhase !== params.staffPassPhrase) {
    return notFound();
  }

  return <Client key={"staff-login"} staff={true} />;
}
