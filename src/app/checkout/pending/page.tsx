"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const CheckoutSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferenceId = searchParams.get("preference_id");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // If preference_id is present, it means Mercado Pago redirected here
    // Wait a moment for webhook to be processed, then redirect
    if (preferenceId) {
      const timer = setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setIsVerifying(false);
  }, [preferenceId]);

  if (isVerifying) {
    return (
      <>
        <Header />
        <Dialog open={true} onOpenChange={() => { }}>
          <DialogContent className="text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            </div>
            <DialogTitle>Processando pagamento...</DialogTitle>
            <DialogDescription>
              Aguarde enquanto confirmamos seu pagamento.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Header />
      <Dialog open={true} >
        <DialogContent className="text-center">
          <Image
            src="/illustration.svg"
            alt="Success"
            width={300}
            height={300}
            className="mx-auto"
          />
          <DialogTitle className="mt-4 text-2xl">Pedido pendente!</DialogTitle>
          <DialogDescription className="font-medium">
            Seu pedido está em aguardando o pagamento. Caso não tenha finalizado o pagamento, você pode tentar novamente clicando no botão abaixo.
          </DialogDescription>

          <DialogFooter>
            <Button
              className="rounded-full"
              size="lg"
              onClick={() => router.push("/my-orders")}
            >
              Pagar novamente
            </Button>
            <Button
              className="rounded-full"
              variant="outline"
              size="lg"
              asChild
            >
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CheckoutSuccessPage = () => {
  return (
    <Suspense fallback={
      <>
        <Header />
        <Dialog open={true} onOpenChange={() => { }}>
          <DialogContent className="text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
            <DialogTitle>Carregando...</DialogTitle>
            <DialogDescription>
              Carregando informações da página.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
};

export default CheckoutSuccessPage;
