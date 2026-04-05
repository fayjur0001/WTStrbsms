import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        className="h-[50px] w-auto"
        src="/images/rsms-logo.png"
        alt="logo"
        width={200}
        height={200}
      />
    </Link>
  );
}
