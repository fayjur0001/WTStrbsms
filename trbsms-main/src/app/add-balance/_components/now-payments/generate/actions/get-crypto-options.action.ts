"use server";

import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import getCryptos from "./commons/get-cryptos";

export default async function getCryptoOptionsAction() {
  return serverAction<{ cryptos: string[] }>(async () => {
    const payload = await validateUser();

    const cryptos = await getCryptos(payload.id);

    return { cryptos };
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

  return auth.getPayload();
}
