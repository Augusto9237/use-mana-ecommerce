import { shippingAddressTable } from "@/db/schema";
import { InferModel } from "drizzle-orm";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import AddressCardActions from "./address-card-actions";
import { formatAddress } from "@/app/cart/helpers/address";

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
      <CardContent className="flex items-center justify-between">
        <CardTitle>{formatAddress(address)}</CardTitle>
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
          createdAt,
          userId: address.userId,
        }} />
      </CardContent>
    </Card>
  );
}

export default AddressCard;
