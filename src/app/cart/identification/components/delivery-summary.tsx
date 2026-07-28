import Image from "next/image";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";

interface DeliverySummaryProps {
  shippingFeeInCents?: number;
}

const DeliverySummary = ({
  shippingFeeInCents = 0,
}: DeliverySummaryProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Frete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <p className="text-sm">Uber Flash</p>
          <p className="text-muted-foreground text-sm font-medium">
            {shippingFeeInCents > 0
              ? formatCentsToBRL(shippingFeeInCents)
              : "GRÁTIS"}
          </p>
        </div>
      </CardContent>
    </>
  );
};

export default DeliverySummary;
