import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />

      <Dialog open={true}>
        <DialogContent className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <CircleCheck className="stroke-emerald-600 size-20 fill-emerald-600/5" />
          </div>

          <h1 className="text-2xl font-semibold">Pagamento efetuado com sucesso!</h1>
          <p className="text-sm text-muted-foreground">
            Seu pedido foi confirmado e já está em processamento.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild >
              <Link href="/my-orders">Ver meus pedidos</Link>
            </Button>
            <Button variant="outline" asChild >
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
