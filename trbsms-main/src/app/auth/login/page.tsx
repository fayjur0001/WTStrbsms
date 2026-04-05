import { Metadata } from "next";
import Client from "./_components/client";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

export default async function Login() {
  return <Client key={"login"} />;
}
