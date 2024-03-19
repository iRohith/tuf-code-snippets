"use client";

import Link from "next/link";
import { DarkModeToggle } from "./dark-mode-toggle";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Logo } from "./logo";

export default function Navbar() {
  return (
    <div className="w-full h-16 fixed top-0 left-0 z-50 inset-x-0 backdrop-blur-md bg-black/20 flex items-center justify-center border-b md:px-[10vw]">
      <header className="w-full">
        <div className="flex flex-row">
          <Logo />
          <div className="px-0 md:px-4 w-full flex flex-row items-center gap-4 mr-4">
            <NavigationMenu>
              <NavigationMenuList>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Edit
                  </NavigationMenuLink>
                </Link>
                <Link href="/submissions" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Submissions
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="px-0 md:px-4 justify-end w-full flex flex-row items-center gap-4 mr-4">
            <DarkModeToggle />
          </div>
        </div>
      </header>
    </div>
  );
}
