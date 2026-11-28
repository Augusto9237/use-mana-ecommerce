"use client";

import { LogInIcon, LogOutIcon, MapPinHouse, MenuIcon, Package, Search, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";
import { InputSearch } from "./input-search";
import { AuthenticationModal } from "./authentication-modal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export const Header = () => {
  const { data: session } = authClient.useSession();
  return (
    <div className="fixed top-0 w-full z-50">
      <div className="w-full bg-background">
        <div className="w-full max-w-screen-xl px-5 py-1 mx-auto flex justify-center items-center gap-4 text-muted-foreground">
          <span className="text-sm max-sm:text-xs">Enviamos para todo o Brasil</span>
        </div>
      </div>
      <header className="p-5 backdrop-blur-md fixed bg-card/70 w-full shadow-md">
        <div className="flex items-center gap-3 justify-between mx-auto w-full max-w-screen-xl xl:px-5">
          <Link href="/" className="h-10 max-w-36 overflow-hidden flex">
            <Image
              src="/logo-lg.png"
              alt="RD Fitness Logo"
              width={120}
              height={80}
              className="object-cover"
            />
          </Link>


          <div className="max-sm:hidden w-full max-w-sm">
            <InputSearch />
          </div>


          <div className="flex items-center gap-3 md:gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button size="icon" variant="outline">
                  <Search />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[100dvw] bg-card/70 backdrop-blur-md border-0 px-5 py-2 mt-5 ring-0 rounded-none sm:hidden">
                <InputSearch />
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-foreground">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-muted-foreground">Menu</SheetTitle>
                </SheetHeader>
                <div className="px-5">
                  {session?.user ? (
                    <>
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={session?.user?.image as string | undefined}
                              />
                              <AvatarFallback>
                                {session?.user?.name?.split(" ")?.[0]?.[0]}
                                {session?.user?.name?.split(" ")?.[1]?.[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h3 className="font-semibold">{session?.user?.name}</h3>
                              <span className="text-muted-foreground block text-xs">
                                {session?.user?.email}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => authClient.signOut()}
                          >
                            <LogOutIcon />
                          </Button>
                        </div>
                        <Link href="/my-orders" className="flex items-center gap-3 font-semibold">
                          <Package />
                          Meus Pedidos
                        </Link>

                        <Link href="/addreses" className="flex items-center gap-3 font-semibold">
                          <MapPinHouse />
                          Meus Endereços
                        </Link>

                        {session?.user?.role === "admin" && (
                          <Link href="/admin" className="flex items-center gap-3 font-semibold text-primary">
                            <Settings />
                            Painel Admin
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Olá. Faça seu login!</h2>
                      <AuthenticationModal />
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Cart />
          </div>
        </div>
      </header>
    </div>

  );
};
