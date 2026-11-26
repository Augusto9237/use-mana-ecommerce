import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCentsToBRL } from "@/helpers/money";
import { Motorbike, PackageCheck, Ship, Store } from "lucide-react";

interface DeliverySummaryProps {
  shippingFeeInCents?: number;
  carrier?: string;
  deliveryType?: "delivery" | "pickup";
  onDeliveryTypeChange?: (deliveryType: "delivery" | "pickup") => void;
}

const DeliverySummary = ({
  shippingFeeInCents = 0,
  carrier = "---",
  deliveryType = "delivery",
  onDeliveryTypeChange,
}: DeliverySummaryProps) => {
  const isMotoboy = carrier === "Motoboy";
  const deliveryLabel = isMotoboy ? "Moto" : "Barco";
  const DeliveryIcon = isMotoboy ? Motorbike : Ship;

  return (
    <>
      <CardHeader>
        <CardTitle>Frete</CardTitle>
      </CardHeader>
      <CardContent>
        {carrier === "---" ? (
          <p className="text-muted-foreground text-sm">
            Selecione um endereço e calcule o frete.
          </p>
        ) : (
          <RadioGroup
            value={deliveryType}
            onValueChange={(value) =>
              onDeliveryTypeChange?.(value as "delivery" | "pickup")
            }
            className="gap-4"
          >
            <Label
              htmlFor="delivery"
              className="flex cursor-pointer items-center justify-between rounded-md border p-3"
            >
              <span className="flex items-center gap-2 text-sm">
                <DeliveryIcon className="size-5" />
                {deliveryLabel}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium">
                  {shippingFeeInCents > 0
                    ? formatCentsToBRL(shippingFeeInCents)
                    : formatCentsToBRL(0)}
                </span>
                <RadioGroupItem value="delivery" id="delivery" />
              </span>
            </Label>

            <Label
              htmlFor="pickup"
              className="flex cursor-pointer items-center justify-between rounded-md border p-3"
            >
              <span className="flex items-center gap-2 text-sm">
                <Store className="size-5" />
                Retira
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium">
                  {formatCentsToBRL(0)}
                </span>
                <RadioGroupItem value="pickup" id="pickup" />
              </span>
            </Label>
          </RadioGroup>
        )}
      </CardContent>
    </>
  );
};

export default DeliverySummary;
