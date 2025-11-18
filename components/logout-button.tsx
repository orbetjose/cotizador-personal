"use client";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  isOpen?: boolean
}

export function LogoutButton({isOpen}: LogoutButtonProps) {
  const router = useRouter();

  console

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} className="bg-transparent text-red-600 hover:bg-transparent hover:underline">
      <LogOut className="h-5 w-5" />
      {isOpen && "Cerrar sesión"}
      
    </Button>
  );
}
