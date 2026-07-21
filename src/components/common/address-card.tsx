import { shippingAddressTable } from "@/db/schema";
import { InferModel } from "drizzle-orm";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import AddressCardActions from "./address-card-actions";

type ShippingAddress = InferModel<typeof shippingAddressTable>;

export function AddressCard({ address }: { address: ShippingAddress }) {
  const {
    recipientName,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    zipCode,
    phone,
    email,
    cpfOrCnpj,
    createdAt,
  } = address;

  return (
    <Card>
      <CardContent className="text-sm flex items-center justify-between">
        <span>{`${street}, ${number}${complement ? ` - ${complement}` : ""}`}</span>
        <div>{`${neighborhood} — ${city} / ${state}`}</div>
        <div>{zipCode}</div>
        <div >{phone} • {email}</div>
        <div >CPF/CNPJ: {cpfOrCnpj}</div>
        <AddressCardActions address={{
          id: address.id,
          recipientName,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zipCode,
          country: address.country || "",
          phone,
          email,
          cpfOrCnpj,
        }} />
      </CardContent>
    </Card>
  );
}

export default AddressCard;
