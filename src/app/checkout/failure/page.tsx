import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  return (
    <>
      <Header />

      <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              ✕
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Pagamento não concluído</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu pedido foi cancelado pois o pagamento não foi finalizado.
            Por favor, tente realizar o pedido novamente.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full">
              <Link href="/cart/identification">Tentar novamente</Link>
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
