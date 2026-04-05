"use client";

import socketIO, { Socket } from "socket.io-client";

let io: Socket | undefined;

export default function socket(): Socket {
  if (!io) {
    const extraHeaders: { extraHeaders?: { Authorization: string } } = {};

    io = socketIO({
      forceNew: true,
      ...extraHeaders,
    });
  }
  return io;
}
