import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/db";
import Payload from "@/types/payload.type";
import Role from "@/types/role.type";

type Auth = {
  verify: typeof verify;
  getPayload: typeof getPayload;
  getNullablePayload: typeof getNullablePayload;
  getToken: typeof getToken;
  setToken: typeof setToken;
  removeToken: typeof removeToken;
};

const tokenName = `${process.env.TOKEN_NAME_SALT}-token`;

export default function getAuth(): Auth {
  return {
    verify,
    getPayload,
    getNullablePayload,
    getToken,
    setToken,
    removeToken,
  };
}

async function removeToken() {
  const cookie = await cookies();
  cookie.delete(tokenName);
}

async function setToken(payload: Payload, days = 0) {
  const cookie = await cookies();
  const header = await headers();
  const proto = header.get("x-forwarded-proto");
  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  cookie.set(tokenName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: proto === "https",
    maxAge: !!days ? days * 24 * 60 * 60 : undefined,
  });

  return token;
}

async function verify(acceptedRoles?: Role | Role[]): Promise<boolean> {
  const payload = await getNullablePayload();
  const role = payload?.role || null;

  acceptedRoles =
    typeof acceptedRoles === "string" ? [acceptedRoles] : acceptedRoles;

  if (!acceptedRoles) {
    if (role) {
      return false;
    }

    return true;
  }

  if (!role || !payload) {
    return false;
  }

  const user = await getUser(payload);

  if (!user) {
    return false;
  }

  if (!payload.isShadowAdmin) {
    const device = await getDevice(payload);

    if (!device) {
      return false;
    }
  }

  if (!acceptedRoles.length) {
    return true;
  }

  if (!acceptedRoles.includes(role)) {
    return false;
  }

  return true;
}

async function getDevice(payload: Payload): Promise<{ id: number } | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  return await db.query.UserDeviceModel.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.userId, payload.id), eq(model.token, token)),
    columns: { id: true },
  }).then((r) => r || null);
}

async function getToken(): Promise<string | null> {
  const token = (await cookies()).get(tokenName)?.value;
  return !!token ? String(token) : null;
}

async function getNullablePayload(): Promise<Payload | null> {
  const token = await getToken();

  if (!token) return null;

  try {
    return await getPayload();
  } catch {
    return null;
  }
}

async function getPayload(): Promise<Payload> {
  const token = await getToken();

  if (!token) {
    throw new Error("no token");
  }

  return jwt.verify(token, process.env.JWT_SECRET!) as Payload;
}

async function getUser(
  payload: Payload,
): Promise<{ id: number; role: Role } | null> {
  return await db.query.UserModel.findFirst({
    where: (model, { eq, and }) =>
      and(
        eq(model.id, payload.id),
        eq(model.role, payload.role),
        eq(model.username, payload.username),
      ),
    columns: { id: true, username: true, role: true },
  }).then((r) => r || null);
}
