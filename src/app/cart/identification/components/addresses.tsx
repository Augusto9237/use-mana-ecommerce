"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { shippingAddressTable } from "@/db/schema";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
import { useCart } from "@/hooks/queries/use-cart";
import { useUserAddresses } from "@/hooks/queries/use-user-addresses";

import { formatAddress } from "../../helpers/address";
import { FormAddress } from "./new-address";
import { Separator } from "@/components/ui/separator";
import DeliverySummary from "./delivery-summary";
import { calculateUberQuote } from "@/actions/calculate-uber-quote";
import Link from "next/link";

const formSchema = z.object({
  email: z.email("E-mail inválido"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  phone: z.string().min(15, "Celular inválido"),
  zipCode: z.string().min(9, "CEP inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressesProps {
  shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
  defaultShippingAddressId: string | null;
}

const Addresses = ({
  shippingAddresses,
  defaultShippingAddressId,
}: AddressesProps) => {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultShippingAddressId || null,
  );
  const [shippingFeeInCents, setShippingFeeInCents] = useState<number>(0);
  const updateCartShippingAddressMutation = useUpdateCartShippingAddress();
  const { data: addresses, isLoading } = useUserAddresses({
    initialData: shippingAddresses,
  });

  const handleGoToPayment = async () => {
    if (!selectedAddress || selectedAddress === "add_new") return;

    try {
      await updateCartShippingAddressMutation.mutateAsync({
        shippingAddressId: selectedAddress,
      });

      const uberQuote = await calculateUberQuote();
      const shippingFeeInCents = uberQuote && !("error" in uberQuote) ? uberQuote.feeInCents : 0;
      setShippingFeeInCents(shippingFeeInCents);
      toast.success("Endereço selecionado para entrega!");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao selecionar endereço. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 h-full flex-1 min-h-0">
      <Card>
        <div className="space-y-5">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Endereço de entrega</CardTitle>
            <FormAddress />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">
                <p>Carregando endereços...</p>
              </div>
            ) : (
              <RadioGroup
                value={selectedAddress}
                onValueChange={setSelectedAddress}
              >
                {addresses?.length === 0 && (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">
                      Você ainda não possui endereços cadastrados.
                    </p>
                  </div>
                )}

                {addresses?.map((address) => (
                  <FieldLabel key={address.id} htmlFor={address.id}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{formatAddress(address)}</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value={address.id} id={address.id} />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            )}

            {selectedAddress && selectedAddress !== "add_new" && (
              <div className="mt-4">
                <Button
                  onClick={handleGoToPayment}
                  className="w-full"
                  disabled={updateCartShippingAddressMutation.isPending}
                >
                  {updateCartShippingAddressMutation.isPending
                    ? "Calculando..."
                    : "Calcular frete"}
                </Button>
              </div>
            )}
          </CardContent>

          <Separator />

          <DeliverySummary
            shippingFeeInCents={shippingFeeInCents}
          />
        </div>
      </Card>
      <div className="flex max-sm:grid grid-cols-2 w-full sm:justify-end px-5 max-sm:p-0 py-5 gap-5  max-w-screen-xl mx-auto">
        <Link href="/" >
          <Button variant="outline" className="max-sm:w-full">Continuar Comprando</Button>
        </Link>
        <Link href="/cart/confirmation" aria-disabled={shippingFeeInCents === 0} >
          <Button disabled={shippingFeeInCents === 0} className="max-sm:w-full">
            Finalizar compra
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Addresses;
