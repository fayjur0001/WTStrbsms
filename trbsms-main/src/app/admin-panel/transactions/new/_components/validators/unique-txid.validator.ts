"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function uniqueTXIDValidator(txid: string) {
  try {
    await validateUser();

    await validateTXID(txid);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);

    return "Internal server error";
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function validateTXID(txid: string) {
  const transaction = await db.query.AddedFundModel.findFirst({
    where: (model, { eq }) => eq(model.txid, txid),
    columns: { id: true },
  });

  if (!!transaction) throw new UnloggingError("TXID already exists.");
}
