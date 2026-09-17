import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function CheckoutFailurePage() {
  return (
    <>
      <Header />

      <Dialog open={true}>
        <DialogContent className="w-full max-w-md text-center">
           <div className="flex justify-center">
          <CircleX className="stroke-red-600 size-20 fill-red-600/5" />
          </div>

          <h1 className="text-2xl font-semibold">Pagamento não concluído</h1>
          <p className="text-sm text-muted-foreground">
            Seu pedido foi cancelado pois o pagamento não foi finalizado.
            Por favor, tente realizar o pedido novamente.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full">
              <Link href="/cart/identification">Tentar novamente</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
