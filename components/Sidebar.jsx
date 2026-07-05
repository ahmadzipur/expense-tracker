"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  const menus = [
    ["🏠", "Dashboard", "/dashboard"],
    ["💳", "Rekening", "/rekening"],
    ["💸", "Transaksi", "/transaksi"]
  ]

  return (
    <>
      {/* Tombol Menu Mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-5 left-5 z-[60] w-12 h-12 rounded-2xl bg-white/10 backdrop-blur"
      >
        ☰
      </button>

      {/* Overlay Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar Utama */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-slate-950/90 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 h-full flex flex-col">
          
          {/* Header Sidebar */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="text-3xl">💳</div>
              <h1 className="font-bold text-2xl">Expense Tracker</h1>
            </div>
            <button
              className="lg:hidden text-2xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="space-y-2">
            {menus.map((m) => (
              <Link
                key={m[2]}
                href={m[2]}
                onClick={() => setOpen(false)}
                className={`flex gap-4 px-5 py-4 rounded-2xl transition ${
                  path === m[2] ? "bg-cyan-500" : "hover:bg-white/10"
                }`}
              >
                <span>{m[0]}</span>
                <span>{m[1]}</span>
              </Link>
            ))}
          </nav>

          {/* Tombol Logout */}
          <div className="mt-auto">
            <a href="/api/logout"
              className="block text-center bg-red-500/20 rounded-2xl py-4">
              Logout
            </a>
          </div>

        </div>
      </aside>
    </>
  )
}
