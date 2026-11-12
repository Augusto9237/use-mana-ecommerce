"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { useRouter } from "next/navigation";

interface FinishOrderButtonProps {
  shippingFeeInCents?: number;
  disabled?: boolean;
}

const FinishOrderButton = ({
  shippingFeeInCents,
  disabled,
}: FinishOrderButtonProps) => {
  const finishOrderMutation = useFinishOrder();
  const route = useRouter();

  const handleFinishOrder = async () => {
    const { orderId } = await finishOrderMutation.mutateAsync({
      shippingFeeInCents,
    });

    const initPoint = await fetch("/api/mercadopago/checkout", {
      method: "POST",
      body: JSON.stringify({
        orderId,
      }),
    });

    const initPointResponse = await initPoint.json();
    if (!initPointResponse.initPoint) {
      throw new Error("Failed to create Mercado Pago preference");
    }

    // Redireciona o usuário para o Checkout Pro do Mercado Pago
    window.location.href = initPointResponse.initPoint;
  };
  return (
    <>
      <Button
        className="w-full"
        size="lg"
        onClick={handleFinishOrder}
        disabled={finishOrderMutation.isPending || disabled}
      >
        {finishOrderMutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Ir para pagamento
      </Button>
    </>
  );
};

export default FinishOrderButton;
