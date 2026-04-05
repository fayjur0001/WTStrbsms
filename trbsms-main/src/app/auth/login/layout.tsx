import getAuth from "@/lib/utils/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = getAuth();

  if (!(await auth.verify())) {
    return redirect("/");
  }

  return (
    <main className="flex h-screen">
      <div className="flex-10 h-full flex flex-col justify-center p-8 md:p-32 gap-10">
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
        <div className="space-y-4">
          <h1 className="text-4xl">Sign in</h1>
          <p className="text-lg capitalize">
            Don&apos;t have account?{" "}
            <Link
              href="/auth/register"
              className="underline text-primary font-extrabold"
            >
              Create now
            </Link>
          </p>
        </div>
        {children}
      </div>
      <SideImage />
    </main>
  );
}

function SideImage() {
  return (
    <div className="hidden md:block flex-12">
      <Image
        src="/images/login-bg.png"
        alt="login"
        width={600}
        height={600}
        className="block size-full object-cover"
        priority={true}
      />
    </div>
  );
}
