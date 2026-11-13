"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShoppingCart,
  Store,
  Truck,
  User,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import {
  calculatePdvUberQuote,
  finishPdvOrder,
  updatePdvCartShippingAddress,
} from "@/actions/pdv";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { shippingAddressTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";

import { PdvAddressForm } from "./pdv-address-form";
import { PdvPrintAlertDialog } from "./pdv-print-alert-dialog";
import { PdvReceiptDialog } from "./pdv-receipt-dialog";
import type { PdvReceiptData } from "./pdv-receipt";

type ShippingAddress = typeof shippingAddressTable.$inferSelect;

interface CartItemData {
  id: string;
  name: string;
  variantName: string;
  color: string;
  size: string;
  quantity: number;
  priceInCents: number;
  imageUrl: string;
}

interface CustomerData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface PdvConfirmationContentProps {
  customer: CustomerData;
  addresses: ShippingAddress[];
  defaultShippingAddressId: string | null;
  items: CartItemData[];
}

export function PdvConfirmationContent({
  customer,
  addresses: initialAddresses,
  defaultShippingAddressId,
  items: initialItems,
}: PdvConfirmationContentProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<ShippingAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultShippingAddressId || addresses[0]?.id || null,
  );
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<
    "money" | "pix" | "credit_card" | "debit_card"
  >("pix");

  const [shippingFeeInCents, setShippingFeeInCents] = useState<number>(0);
  const [uberQuoteId, setUberQuoteId] = useState<string | undefined>(undefined);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isFinishingOrder, setIsFinishingOrder] = useState(false);

  // Estados para impressão e comprovante do pedido
  const [receiptModalData, setReceiptModalData] =
    useState<PdvReceiptData | null>(null);
  const [isPrintAlertOpen, setIsPrintAlertOpen] = useState(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [isSaleCompleted, setIsSaleCompleted] = useState(false);

  // Preserva os itens no estado para que a revalidação da Server Action não apague a tela após o banco limpar o carrinho
  const [items] = useState<CartItemData[]>(initialItems);

  // Cálculos financeiros
  const subtotalInCents = items.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0,
  );
  const finalShippingFee = deliveryType === "pickup" ? 0 : shippingFeeInCents;
  const totalInCents = subtotalInCents + finalShippingFee;

  // Calcular frete para o endereço selecionado
  const handleCalculateShipping = async () => {
    if (!selectedAddressId) {
      toast.error("Selecione um endereço para calcular o frete.");
      return;
    }

    try {
      setIsCalculatingShipping(true);
      await updatePdvCartShippingAddress({
        customerId: customer.id,
        shippingAddressId: selectedAddressId,
      });

      const quote = await calculatePdvUberQuote(customer.id);

      if (!quote) {
        toast.error("Não foi possível calcular o frete para este endereço.");
        return;
      }

      if ("error" in quote && quote.error) {
        toast.error(quote.message || "Erro no cálculo de frete da Uber.");
        return;
      }

      if ("feeInCents" in quote && typeof quote.feeInCents === "number") {
        setShippingFeeInCents(quote.feeInCents);
        setUberQuoteId(quote.quoteId);
        toast.success(
          `Frete calculado: ${formatCentsToBRL(quote.feeInCents)} via Uber Direct!`,
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao calcular frete.");
      console.error(error);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Concluir a venda do PDV
  const handleFinishSale = async () => {
    const addressToUse =
      selectedAddressId || addresses[0]?.id;

    if (!addressToUse) {
      toast.error(
        "É necessário ter ao menos um endereço de cadastro para o cliente.",
      );
      return;
    }

    if (deliveryType === "delivery" && shippingFeeInCents === 0 && !uberQuoteId) {
      toast.warning(
        "Atenção: O frete ainda não foi cotado. Calcule o frete ou confirme a taxa zerada.",
      );
    }

    try {
      setIsFinishingOrder(true);
      const result = await finishPdvOrder({
        customerId: customer.id,
        shippingAddressId: addressToUse,
        paymentMethod,
        deliveryType,
        shippingFeeInCents: finalShippingFee,
        uberQuoteId,
      });

      if (result.success && result.orderId) {
        setIsSaleCompleted(true);
        toast.success("Venda finalizada com sucesso no PDV!");

        const addressUsed =
          addresses.find((a) => a.id === addressToUse) || null;

        const receiptData: PdvReceiptData = {
          orderId: result.orderId,
          date: new Date(),
          customer: {
            name: customer.name,
            email: customer.email,
          },
          address: addressUsed,
          deliveryType,
          paymentMethod,
          items,
          subtotalInCents,
          shippingFeeInCents: finalShippingFee,
          totalInCents,
        };

        setReceiptModalData(receiptData);
        setIsPrintAlertOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao concluir a venda.");
      console.error(error);
    } finally {
      setIsFinishingOrder(false);
    }
  };

  // Resposta do Alert Dialog de Impressão
  const handleConfirmPrint = () => {
    setIsPrintAlertOpen(false);
    toast.success("Enviando comprovante para impressão...");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleSkipPrint = () => {
    setIsPrintAlertOpen(false);
    toast.info("Venda concluída sem impressão do comprovante.");
  };

  // Visualizar / Imprimir comprovante ou prévia completa
  const handleOpenReceiptPreview = () => {
    const addressUsed =
      addresses.find(
        (a) => a.id === (selectedAddressId || addresses[0]?.id),
      ) || null;

    setReceiptModalData(
      receiptModalData || {
        orderId: "PREVIA",
        date: new Date(),
        customer: {
          name: customer.name,
          email: customer.email,
        },
        address: addressUsed,
        deliveryType,
        paymentMethod,
        items,
        subtotalInCents,
        shippingFeeInCents: finalShippingFee,
        totalInCents,
      },
    );
    setIsReceiptPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Barra de navegação e cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finalização da Venda (PDV)
          </h1>
          <p className="text-sm text-muted-foreground">
            Confirme os dados de entrega, resumo dos produtos e forma de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium"
            onClick={handleOpenReceiptPreview}
          >
            <Printer className="size-4" />
            {isSaleCompleted ? "Ver / Reimprimir Cupom" : "Prévia do Cupom"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Coluna da esquerda: Tipo de Entrega e Endereço */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Modalidade de entrega */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                Modalidade de Entrega
              </CardTitle>
              <CardDescription>
                Escolha se o cliente irá retirar no balcão da loja ou receber via entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryType("pickup")}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    deliveryType === "pickup"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Store className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Retirada no Balcão</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cliente retira o produto presencialmente no PDV.
                    </p>
                    <span className="inline-block mt-2 text-xs font-bold text-emerald-500">
                      Frete Grátis
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryType("delivery")}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    deliveryType === "delivery"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Truck className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Entrega no Endereço</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Envio via Uber Direct / Entregador para o endereço do cliente.
                    </p>
                    <span className="inline-block mt-2 text-xs font-semibold text-primary">
                      {shippingFeeInCents > 0
                        ? formatCentsToBRL(shippingFeeInCents)
                        : "Calcular frete"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Seleção de Endereço (semelhante ao identification/addresses) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {deliveryType === "delivery"
                    ? "Endereço de Entrega"
                    : "Endereço de Cadastro / Faturamento"}
                </CardTitle>
                <CardDescription>
                  {deliveryType === "delivery"
                    ? "Selecione para onde o pedido será enviado"
                    : "Endereço vinculado ao cadastro do cliente"}
                </CardDescription>
              </div>

              <PdvAddressForm
                customerId={customer.id}
                customerDefaultInfo={{
                  name: customer.name,
                  email: customer.email,
                }}
                onSuccess={(newId) => {
                  setSelectedAddressId(newId);
                  router.refresh();
                }}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <div className="py-6 text-center border rounded-lg border-dashed">
                  <MapPin className="mx-auto size-8 text-muted-foreground opacity-40 mb-2" />
                  <p className="text-sm font-medium">Nenhum endereço cadastrado</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Cadastre o endereço do cliente para prosseguir com a venda.
                  </p>
                  <PdvAddressForm
                    customerId={customer.id}
                    customerDefaultInfo={{
                      name: customer.name,
                      email: customer.email,
                    }}
                    onSuccess={(newId) => {
                      setSelectedAddressId(newId);
                      router.refresh();
                    }}
                  />
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <RadioGroup
                    value={selectedAddressId || ""}
                    onValueChange={(val) => {
                      setSelectedAddressId(val);
                      setShippingFeeInCents(0);
                      setUberQuoteId(undefined);
                    }}
                    className="space-y-2 pr-2"
                  >
                    {addresses.map((addr) => (
                      <FieldLabel
                        key={addr.id}
                        htmlFor={addr.id}
                        className={cn(
                          "block rounded-lg border cursor-pointer transition-colors",
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/30",
                        )}
                      >
                        <Field orientation="horizontal" className="items-center justify-between gap-3">
                          <FieldContent className="min-w-0">
                            <FieldTitle className="text-sm font-medium">
                              {addr.recipientName}
                            </FieldTitle>
                            <p className="text-xs text-muted-foreground truncate">
                              {addr.street}, {addr.number}
                              {addr.complement && ` - ${addr.complement}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {addr.neighborhood}, {addr.city} - {addr.state} • CEP {addr.zipCode}
                            </p>
                          </FieldContent>
                          <RadioGroupItem value={addr.id} id={addr.id} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              )}

              {/* Botão de calcular frete caso seja entrega */}
              {deliveryType === "delivery" && addresses.length > 0 && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!selectedAddressId || isCalculatingShipping}
                    onClick={handleCalculateShipping}
                  >
                    {isCalculatingShipping ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Calculando cotação Uber...
                      </>
                    ) : (
                      <>
                        <Truck className="mr-2 size-4" />
                        {shippingFeeInCents > 0
                          ? "Recalcular Frete Uber"
                          : "Calcular Frete Uber Direct"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Forma de Pagamento no PDV */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Forma de Pagamento
              </CardTitle>
              <CardDescription>
                Selecione como o cliente realizou o pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setPaymentMethod("pix")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer gap-2 text-center transition-all",
                    paymentMethod === "pix"
                      ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <QrCode className="size-5 text-primary" />
                  <span className="text-xs">PIX</span>
                </div>

                <div
                  onClick={() => setPaymentMethod("credit_card")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer gap-2 text-center transition-all",
                    paymentMethod === "credit_card"
                      ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <CreditCard className="size-5 text-primary" />
                  <span className="text-xs">Crédito</span>
                </div>

                <div
                  onClick={() => setPaymentMethod("debit_card")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer gap-2 text-center transition-all",
                    paymentMethod === "debit_card"
                      ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <CreditCard className="size-5 text-primary" />
                  <span className="text-xs">Débito</span>
                </div>

                <div
                  onClick={() => setPaymentMethod("money")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer gap-2 text-center transition-all",
                    paymentMethod === "money"
                      ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <Banknote className="size-5 text-primary" />
                  <span className="text-xs">Dinheiro</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da direita: Resumo do Pedido e Botão Finalizar */}
        <div className="space-y-5">
          <Card className="w-full">
            <CardHeader className="border-b border-border">
              <CardTitle>Resumo do Pedido</CardTitle>
              Cliente: {customer.name} - {customer.email}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista dos produtos */}
              <ScrollArea className="max-h-80 pr-2">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div className="flex items-center justify-between" key={item.id}>
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={78}
                          height={78}
                          className="rounded-lg aspect-square object-cover size-[80px]"
                        />
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-muted-foreground text-xs font-medium">
                            {item.variantName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-2">
                        <p className="text-sm font-bold">
                          {formatCentsToBRL(item.priceInCents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              {/* Linhas de valores */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCentsToBRL(subtotalInCents)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium">
                    {deliveryType === "pickup" ? (
                      <span className="text-emerald-500 font-bold">GRÁTIS</span>
                    ) : shippingFeeInCents > 0 ? (
                      formatCentsToBRL(shippingFeeInCents)
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Não calculado
                      </span>
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-1">
                  <span className="text-base font-bold">Total a Pagar</span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatCentsToBRL(totalInCents)}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 space-y-2">
                {isSaleCompleted ? (
                  <>
                    <Button
                      className="w-full text-base font-semibold"
                      size="lg"
                      onClick={() => setIsPrintAlertOpen(true)}
                    >
                      <Printer className="mr-2 size-5" />
                      Imprimir Comprovante
                    </Button>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="default"
                        asChild
                        className="w-full text-xs font-semibold"
                      >
                        <Link href="/admin/pdv">Nova Venda</Link>
                      </Button>
                      <Button
                        variant="secondary"
                        asChild
                        className="w-full text-xs font-semibold"
                      >
                        <Link href="/admin/orders">Ver Pedidos</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full text-base font-semibold"
                      size="lg"
                      disabled={isFinishingOrder || items.length === 0}
                      onClick={handleFinishSale}
                    >
                      {isFinishingOrder ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Finalizando venda...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 size-5" />
                          Concluir Venda
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" asChild className="w-full text-xs">
                      <Link href="/admin/pdv">Cancelar e voltar ao PDV</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Dialog de Confirmação para Imprimir */}
      <PdvPrintAlertDialog
        open={isPrintAlertOpen}
        onOpenChange={setIsPrintAlertOpen}
        data={receiptModalData}
        onConfirmPrint={handleConfirmPrint}
        onSkipPrint={handleSkipPrint}
      />

      {/* Modal de Prévia / Visualização Completa do Cupom */}
      <PdvReceiptDialog
        open={isReceiptPreviewOpen}
        onOpenChange={setIsReceiptPreviewOpen}
        data={receiptModalData}
        onNewSale={() => {
          setIsReceiptPreviewOpen(false);
          router.push("/admin/pdv");
        }}
      />
    </div>
  );
}

