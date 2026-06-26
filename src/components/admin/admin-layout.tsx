"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Folder,
  Users,
  Ticket,
  Settings,
  ShoppingBag,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Produtos",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: Folder,
  },
  {
    label: "Clientes",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Cupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    label: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-screen bg-background">
      <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-background">
            <div className="flex items-center justify-between p-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-2" size={18} />
                  <Input
                    placeholder="Buscar no painel"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                </Button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    Administrador
                  </span>
                  <Button variant="ghost" size="sm">
                    ▼
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
