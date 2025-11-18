"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

import {
  FileText,
  Users,
  Menu,
} from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-screen border-r bg-white transition-all duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* CONTROLES SUPERIORES */}
      <div className="p-4 flex items-center justify-between">
        <span className={`font-bold text-xl transition-opacity ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
          Panel admin
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-10 w-10" />
        </Button>
      </div>

      <div className="px-3 space-y-4 mt-6">
        {/* Cotizaciones */}
        <Link className="block" href="/dashboard/cotizaciones">
          <Button
            variant="ghost"
            className="w-full flex justify-start gap-3 text-lg cursor-pointer"
          >
            <FileText className="h-10 w-10" />
            {isOpen && "Cotizaciones"}
          </Button>
        </Link>

        {/* Clientes */}
        <Link className="block" href="/dashboard/clientes">
          <Button
            variant="ghost"
            className="w-full flex justify-start gap-3 text-lg cursor-pointer"
          >
            <Users className="h-6 w-6" />
            {isOpen && "Clientes"}
          </Button>
        </Link>

        {/* SEPARADOR */}
        <div className="border-t my-4" />

        {/* Cerrar sesión */}
      <LogoutButton isOpen={isOpen} />
      </div>
    </div>
  );
}
