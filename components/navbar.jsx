"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { WelcomeSidebar } from "./welcome-sidebar"

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-earth-beige/40 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="SmartCare Logo" width={36} height={36} className="h-9 w-9" />
          <span className="text-xl font-bold text-soft-amber">SmartCare</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link href="/" className="text-sm font-medium text-graphite transition-colors hover:text-soft-amber">
            Home
          </Link>
          <Link
            href="/information?section=about"
            className="text-sm font-medium text-graphite transition-colors hover:text-soft-amber"
          >
            About
          </Link>
          <Link
            href="/information?section=services"
            className="text-sm font-medium text-graphite transition-colors hover:text-soft-amber"
          >
            Services
          </Link>
          <Link
            href="/information?section=doctors"
            className="text-sm font-medium text-graphite transition-colors hover:text-soft-amber"
          >
            Doctors
          </Link>
          <Link
            href="/information?section=contact"
            className="text-sm font-medium text-graphite transition-colors hover:text-soft-amber"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex md:items-center md:space-x-4">
          <Link
            href="/login"
            className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-drift-gray hover:bg-pale-stone hover:text-soft-amber md:hidden"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      <WelcomeSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
    </header>
  )
}
