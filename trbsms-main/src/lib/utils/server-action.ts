import ResponseWraper from "@/types/response-wraper.type";
import UnloggingError from "./unlogging-error";

export default async function serverAction<
  R = Record<string, unknown>,
  Field extends string | undefined = undefined,
>(body: () => Promise<R>): Promise<ResponseWraper<R, Field>> {
  try {
    const data = await body();

    return { success: true, ...data };
  } catch (e) {
    if (e instanceof UnloggingError) {
      if (!!e.field)
        return { success: false, field: e.field, message: e.message };

      return { success: false, message: e.message };
    }

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}
