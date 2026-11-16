import { shippingAddressTable } from "@/db/schema";
import { InferModel } from "drizzle-orm";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import AddressCardActions from "./address-card-actions";
import { formatAddress } from "@/app/cart/helpers/address";
import { MapPin } from "lucide-react";

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
    <Card className="p-0">
      <CardContent className="flex flex-row items-center justify-between p-4">
        <div className="flex justify-start gap-2">
          <MapPin strokeWidth={1.75} className="my-auto size-8 sm:size-5" />
          <CardTitle >{formatAddress(address)}</CardTitle>
        </div>
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
