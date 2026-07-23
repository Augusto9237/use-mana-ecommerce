"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormAddress } from "@/app/cart/identification/components/new-address";

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
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ShippingAddress>({ ...address });

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/shipping-address/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      alert("Erro ao salvar");
    }
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
        <FormAddress address={address} trigger={
          <DropdownMenuItem className="gap-2" onSelect={(e) => e.preventDefault()}>
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
        } />
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
