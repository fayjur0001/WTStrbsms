import Payload from "@/types/payload.type";
import next from "next";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import db from "@/db";
import { UserModel } from "@/db/schema";
import { eq } from "drizzle-orm";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });

const handler = app.getRequestHandler();

type Auth = {
  token?: string;
  payload?: Payload;
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    const auth: Auth = {};

    socket.on("disconnect", async () => {
      await logout({ auth, socket, io });
    });

    socket.on("/auth/login", async (token, res) => {
      await login({ auth, token, socket, io });
      return res({ success: true });
    });

    socket.on("/auth/logout", async (res) => {
      await logout({ auth, socket, io });
      return res({ success: true });
    });

    try {
      await autoLogin({ auth, socket, io });
    } catch {
      return;
    }
  });

  httpServer.on("request", (req, res) => onUpdate({ req, res, io }));

  httpServer
    .once("error", (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

async function autoLogin({
  auth,
  socket,
  io,
}: {
  auth: Auth;
  socket: Socket;
  io: Server;
}) {
  const tokenName = `${process.env.TOKEN_NAME_SALT}-token`;

  const token = socket.handshake.headers.cookie
    ?.match(new RegExp(tokenName + "=.*"))
    ?.at(0)
    ?.split(";")
    .at(0)
    ?.replace(tokenName + "=", "");

  if (!!token) await login({ auth, token, socket, io });
}

async function login({
  auth,
  token,
  socket,
  io,
}: {
  auth: Auth;
  token: string;
  socket: Socket;
  io: Server;
}) {
  try {
    auth.payload = jwt.verify(token, process.env.JWT_SECRET!) as Payload;
    auth.token = token;

    if (!auth.payload) return;

    const tokenRoom = io.sockets.adapter.rooms.get(`token-${auth.payload.id}`);

    if (!tokenRoom || !tokenRoom.size || tokenRoom.size < 1) {
      await db
        .update(UserModel)
        .set({ isOnline: true })
        .where(eq(UserModel.id, auth.payload.id));
      io.to("admin").emit("/admin-panel/users", {
        id: auth.payload.id,
        action: "update",
      });
    }

    socket.emit("/profile/role");
    joinRoom(auth, socket);
  } catch {
    delete auth.token;
    delete auth.payload;
  }
}

async function logout({
  auth,
  io,
  socket,
}: {
  auth: Auth;
  io: Server;
  socket: Socket;
}) {
  if (!auth.token || !auth.payload) return;

  //logged in room
  socket.leave("logged-in");
  //token room
  socket.leave(`token-${auth.payload.id}`);
  // user room
  socket.leave(`user-${auth.payload.id}`);
  //admin room
  if (["admin", "super admin"].includes(auth.payload.role))
    socket.leave("admin");
  //general room
  else socket.leave("general");

  const tokenRoom = io.sockets.adapter.rooms.get(`token-${auth.payload.id}`);

  if (!tokenRoom || !tokenRoom.size || tokenRoom.size < 1) {
    await db
      .update(UserModel)
      .set({ isOnline: false })
      .where(eq(UserModel.id, auth.payload.id));
    io.to("admin").emit("/admin-panel/users", {
      action: "update",
      id: auth.payload.id,
    });
  }

  delete auth.token;
  delete auth.payload;

  socket.emit("/profile/role");
}

function joinRoom(auth: Auth, socket: Socket) {
  if (!auth.payload || !auth.payload) return;

  //logged in room
  socket.join("logged-in");
  //token room
  socket.join(`token-${auth.payload.id}`);
  // user room
  socket.join(`user-${auth.payload.id}`);
  //staff room
  if (["admin", "super admin", "support"].includes(auth.payload.role)) {
    //staff room
    if (["admin", "super admin", "support"].includes(auth.payload.role))
      socket.join("staff");
    //admin room
    if (["admin", "super admin"].includes(auth.payload.role))
      socket.join("admin");
  }
  //general room
  else socket.join("general");
}

function onUpdate({
  req,
  res,
  io,
}: {
  req: IncomingMessage;
  res: ServerResponse;
  io: Server;
}) {
  if (req.url?.startsWith("/pusher"))
    push({
      searchParams: new URLSearchParams(req.url.split("?").at(1)),
      res,
      io,
    });
}

function push({
  searchParams,
  res,
  io,
}: {
  searchParams: URLSearchParams;
  res: ServerResponse;
  io: Server;
}) {
  const secret = searchParams.get("secret");
  const to = searchParams.get("to");
  const page = searchParams.get("page");
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  if (secret !== process.env.PUSHER_SECRET) {
    res.statusCode = 403;
    res.end();
    return;
  }

  if (!page) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const emmiter = io;

  if (!!to) {
    emmiter.to(to);
  }

  if (!!action) {
    const payload = {
      action,
      id: Number(id),
    };

    emmiter.emit(page, payload);
  } else emmiter.emit(page);

  res.end();
}
