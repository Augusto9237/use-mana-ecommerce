"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Trash2 } from "lucide-react";

import { AddressForm } from "@/components/common/address-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShippingAddress = {
  id: string;
  recipientName: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  cpfOrCnpj: string;
  createdAt: Date;
  userId: string;
};

export default function AddressCardActions({ address }: { address: ShippingAddress }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Excluir este endereço?")) return;
    setLoading(true);
    const res = await fetch("/api/shipping-address/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: address.id }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Erro ao excluir");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
        >
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <AddressForm
          address={address}
          onSuccess={() => router.refresh()}
          trigger={
            <DropdownMenuItem
              className="gap-2"
              onSelect={(e) => e.preventDefault()}
            >
              Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={loading}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
