import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import FavIcon from "@/app/favicon.ico";

export const Logo = ({
  imgClassName,
  textClassName,
}: Readonly<{ imgClassName?: string; textClassName?: string }>) => {
  return (
    <Link
      href="/"
      className="flex flex-row items-center min-w-fit mx-0 md:mx-8"
    >
      <Image
        src={FavIcon}
        alt="Logo"
        className={cn("w-8 h-8 m-2 dark:invert", imgClassName)}
      />
      <span
        className={cn(
          "font-bold text-xl md:text-3xl text-primary",
          textClassName
        )}
      >
        TUFCS
      </span>
    </Link>
  );
};
