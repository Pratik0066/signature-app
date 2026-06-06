"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  PlusCircle,
  Users,
  Settings,
} from "lucide-react";

export function MobileNav() {
  return (
    <div
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        h-16
        bg-[#12121A]
        border-t
        border-white/10
        flex
        items-center
        justify-around
      "
    >
      <Link href="/dashboard">
        <Home />
      </Link>

      <Link href="/dashboard/documents">
        <FileText />
      </Link>

      <Link href="/upload">
        <PlusCircle className="text-violet-500" />
      </Link>

      <Link href="/dashboard/signers">
        <Users />
      </Link>

      <Link href="/dashboard/settings">
        <Settings />
      </Link>
    </div>
  );
}