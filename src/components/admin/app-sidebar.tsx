"use client";

import Link from "next/link";
import Image from "next/image";
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
  UserRoundCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <Image
                  src="/logo.png"
                  alt="RD Fitness"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">RD FITNESS</span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 space-y-3">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2 items-center p-3">
            <UserRoundCog />
            Administrador
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
