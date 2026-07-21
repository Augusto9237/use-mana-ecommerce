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

type ShippingAddress = {
  id: string;
  recipientName: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  cpfOrCnpj: string;
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
    <div className="mt-3">
      {!editing ? (
        <div className="flex justify-end">
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
              <DropdownMenuItem onClick={() => setEditing(true)} className="gap-2">
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
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
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3 rounded-md border bg-muted/20 p-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="border p-2" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
            <input className="border p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="border p-2" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <input className="border p-2" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            <input className="border p-2" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            <input className="border p-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="border p-2" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input className="border p-2" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
