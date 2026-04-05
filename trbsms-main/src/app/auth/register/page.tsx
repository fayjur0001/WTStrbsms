import { Metadata } from "next";
import Client from "./_components/client";
import Image from "next/image";
import getAuth from "@/lib/utils/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register",
};

export default async function Register() {
  const auth = getAuth();

  if (!(await auth.verify())) {
    redirect("/");
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="space-y-6 md:space-y-8 px-6 md:px-32 py-10 flex-10 my-auto">
        <div className="flex items-center justify-center">
          <Image
            src="/images/rsms-logo.png"
            alt="logo"
            width={200}
            height={200}
            priority={true}
            className="block h-[70px] w-auto"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">Sign up</h1>
        <h3 className="text-lg md:text-2xl text-primary underline md:no-underline">
          Create your account
        </h3>
        <Client />
      </div>
      <SideImage />
    </main>
  );
}

function SideImage() {
  return (
    <div className="flex-14 hidden md:block">
      <Image
        src={"/images/register-bg.png"}
        alt="register-bg"
        width={600}
        height={600}
        className="block size-full object-cover origin-center"
        priority={true}
      />
    </div>
  );
}
