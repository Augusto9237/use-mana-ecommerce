"use client";

import { Loader2 } from "lucide-react";

import { createCheckoutPreference } from "@/actions/create-checkout-preference";
import { Button } from "@/components/ui/button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { useRouter } from "next/navigation";

const FinishOrderButton = () => {
  const finishOrderMutation = useFinishOrder();
  const route = useRouter();

  const handleFinishOrder = async () => {
    const { orderId } = await finishOrderMutation.mutateAsync();

    const { initPoint } = await createCheckoutPreference({
      orderId,
    });

    if (!initPoint) {
      throw new Error("Failed to create Mercado Pago preference");
    }

    // Redireciona o usuário para o Checkout Pro do Mercado Pago
    route.push(initPoint);
  };
  return (
    <>
      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={handleFinishOrder}
        disabled={finishOrderMutation.isPending}
      >
        {finishOrderMutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Finalizar compra
      </Button>
    </>
  );
};

export default FinishOrderButton;
