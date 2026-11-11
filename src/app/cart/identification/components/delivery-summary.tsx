import Image from "next/image";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";
import { Motorbike, Ship } from "lucide-react";

interface DeliverySummaryProps {
  shippingFeeInCents?: number;
  carrier?: string;
}

const DeliverySummary = ({
  shippingFeeInCents = 0,
  carrier = "---",
}: DeliverySummaryProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Frete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <div className="text-sm">
            {carrier === "Motoboy" ? <span className="flex items-center gap-2"><Motorbike className="size-6"/> Motoboy</span> : <span className="flex items-center gap-2"><Ship className="size-6" /> Barco</span>}
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            {shippingFeeInCents > 0
              ? formatCentsToBRL(shippingFeeInCents)
              : formatCentsToBRL(0)}
          </p>
        </div>
      </CardContent>
    </>
  );
};

export default DeliverySummary;
