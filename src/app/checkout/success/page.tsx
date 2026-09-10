import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />

      <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Pagamento efetuado com sucesso!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu pedido foi confirmado e já está em processamento.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full">
              <Link href="/my-orders">Ver meus pedidos</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
