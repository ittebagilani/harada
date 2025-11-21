"use client";
import React, { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignUpButton } from "@clerk/nextjs";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Menu as MenuIcon, X } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full py-5 px-4 md:px-8 flex items-center justify-between md:justify-center relative bg-[#f5f5f3]">
      {/* Left: Simple mark */}
      <div className="md:absolute md:left-8">
        <Link href={"/"} className="text-lg font-light tracking-tight text-neutral-900 dark:text-white">
          harada
        </Link>
      </div>

      {/* Center navbar (desktop only) */}
      <div className="hidden md:flex">
        <NavbarMenu />
      </div>

      {/* Right: Auth + Mobile Toggle */}
      <div className="flex items-center space-x-3 md:absolute md:right-8">
        <SignedIn>
          <UserButton afterSignOutUrl="/"/>
        </SignedIn>

        <SignedOut>
          <SignUpButton>
            <button className="hidden sm:block px-4 py-1.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 cursor-pointer text-sm font-light transition-colors">
              sign up
            </button>
          </SignUpButton>
        </SignedOut>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X size={20} className="text-neutral-900 dark:text-white" />
          ) : (
            <MenuIcon size={20} className="text-neutral-900 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-40 md:hidden mt-2"
          >
            <div className="flex flex-col items-center py-8 space-y-6 px-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sm font-light text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sm font-light text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Products
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sm font-light text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Pricing
              </button>

              <SignedOut>
                <SignUpButton>
                  <button className="w-full max-w-xs px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-sm font-light transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}

function NavbarMenu({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className={cn("z-50", className)}>
      <Menu setActive={setActive}>
        <MenuItem
          setActive={setActive}
          active={active}
          item="how it works"
        ></MenuItem>
        
        <MenuItem
          setActive={setActive}
          active={active}
          item="Pricing"
        ></MenuItem>
      </Menu>
    </div>
  );
}

