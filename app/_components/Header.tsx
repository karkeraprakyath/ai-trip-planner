"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { UserProfile } from "./UserProfile";
import { usePathname } from "next/navigation";

const menuOptions = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact us", path: "/contact-us" },
];

function Header() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex justify-between items-center px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 border-b">
      
      <div className="flex gap-2 items-center">
        <Image src="/Logo.svg" alt="logo image" width={30} height={30} style={{ height: "auto" }} />
        <h2 className="font-bold text-2xl text-foreground">AI Trip Planner</h2>
      </div>

    
      <div className="hidden md:flex gap-8 items-center">
        {menuOptions.map((menu, index) => (
          <Link href={menu.path} key={index}>
            <h2 className="text-lg hover:scale-105 transition-all hover:text-primary">
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>

      
      <div className="flex items-center gap-2">
        
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        
        {!user ? (
          <>
            <SignInButton mode="modal">
              <Button>Get Started</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="secondary">Sign Up</Button>
            </SignUpButton>
          </>
        ) : (
          <>
            {pathname === "/create-new-trip" ? (
              <Link href="/my-trips">
                <Button>My Trips</Button>
              </Link>
            ) : (
              <Link href="/create-new-trip">
                <Button>Create New Trip</Button>
              </Link>
            )}
            <UserButton />
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
