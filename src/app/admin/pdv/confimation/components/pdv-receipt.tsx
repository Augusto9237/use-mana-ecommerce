"use client";

import { forwardRef } from "react";
import { shippingAddressTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

type ShippingAddress = typeof shippingAddressTable.$inferSelect;

export interface PdvReceiptData {
  orderId: string;
  date: Date | string;
  customer: {
    name: string;
    email: string;
  };
  address?: ShippingAddress | null;
  deliveryType: "pickup" | "delivery";
  paymentMethod: "money" | "pix" | "credit_card" | "debit_card";
  items: Array<{
    id: string;
    name: string;
    variantName?: string;
    color?: string;
    size?: string;
    quantity: number;
    priceInCents: number;
  }>;
  subtotalInCents: number;
  shippingFeeInCents: number;
  totalInCents: number;
}

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  money: "Dinheiro",
};

interface PdvReceiptProps {
  data: PdvReceiptData;
}

export const PdvReceipt = forwardRef<HTMLDivElement, PdvReceiptProps>(
  ({ data }, ref) => {
    const formattedDate =
      typeof data.date === "string"
        ? data.date
        : data.date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

    return (
      <div
        ref={ref}
        id="pdv-thermal-receipt"
        className="w-full max-w-[340px] mx-auto bg-white text-zinc-900 p-4 font-mono text-xs leading-relaxed border border-dashed border-zinc-300 rounded-sm shadow-xs print:border-none print:shadow-none print:p-0 print:max-w-full"
      >
        {/* Cabeçalho da Loja */}
        <div className="text-center pb-3 border-b border-dashed border-zinc-400">
          <h2 className="text-base font-extrabold tracking-wider uppercase">
            RD FITNESS
          </h2>
          <p className="text-[10px] text-zinc-600">
            Equipamentos & Vestuário Fitness
          </p>
          <p className="text-[10px] text-zinc-600">
            CNPJ: 00.000.000/0001-00 • Balcão PDV
          </p>
          <div className="mt-1 pt-1 border-t border-dotted border-zinc-300">
            <span className="font-bold text-[11px] block">
              COMPROVANTE DE VENDA
            </span>
            <span className="text-[10px] text-zinc-500 block">
              (NÃO É DOCUMENTO FISCAL)
            </span>
          </div>
        </div>

        {/* Informações do Pedido */}
        <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-600">Pedido:</span>
            <span className="font-bold">
              #{data.orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Data/Hora:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Cliente:</span>
            <span className="font-semibold truncate max-w-[190px]">
              {data.customer.name}
            </span>
          </div>
          {data.address?.cpfOrCnpj && (
            <div className="flex justify-between">
              <span className="text-zinc-600">CPF/CNPJ:</span>
              <span>{data.address.cpfOrCnpj}</span>
            </div>
          )}
          {data.address?.phone && (
            <div className="flex justify-between">
              <span className="text-zinc-600">Telefone:</span>
              <span>{data.address.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-600">Modalidade:</span>
            <span className="font-medium">
              {data.deliveryType === "pickup"
                ? "Retirada no Balcão"
                : "Entrega no Endereço"}
            </span>
          </div>
          {data.deliveryType === "delivery" && data.address && (
            <div className="pt-1 text-[11px] text-zinc-700">
              <span className="text-zinc-600 block">Endereço de entrega:</span>
              <p className="leading-tight">
                {data.address.street}, {data.address.number}
                {data.address.complement && ` - ${data.address.complement}`}
              </p>
              <p className="leading-tight">
                {data.address.neighborhood}, {data.address.city} -{" "}
                {data.address.state} • CEP {data.address.zipCode}
              </p>
            </div>
          )}
        </div>

        {/* Itens do Pedido */}
        <div className="py-2.5 border-b border-dashed border-zinc-400">
          <div className="flex justify-between text-[11px] font-bold pb-1.5 border-b border-dotted border-zinc-300">
            <span>ITEM / DESCRIÇÃO</span>
            <span>TOTAL</span>
          </div>
          <div className="space-y-2 pt-1.5">
            {data.items.map((item, index) => (
              <div key={item.id || index} className="space-y-0.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium truncate max-w-[220px]">
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-bold shrink-0">
                    {formatCentsToBRL(item.priceInCents * item.quantity)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600 pl-3">
                  <span>
                    Tam: {item.size || "Único"}
                    {item.color ? ` • Cor: ${item.color}` : ""}
                  </span>
                  <span>
                    {item.quantity} un x {formatCentsToBRL(item.priceInCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totais e Pagamento */}
        <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-600">Subtotal:</span>
            <span>{formatCentsToBRL(data.subtotalInCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Frete:</span>
            <span>
              {data.deliveryType === "pickup"
                ? "GRÁTIS"
                : data.shippingFeeInCents > 0
                  ? formatCentsToBRL(data.shippingFeeInCents)
                  : "R$ 0,00"}
            </span>
          </div>
          <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-dotted border-zinc-300">
            <span>TOTAL:</span>
            <span>{formatCentsToBRL(data.totalInCents)}</span>
          </div>
          <div className="flex justify-between pt-1 text-[11px]">
            <span className="text-zinc-600">Pagamento:</span>
            <span className="font-bold">
              {paymentMethodLabels[data.paymentMethod] || data.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-600">Situação:</span>
            <span className="font-bold text-emerald-700">PAGO / APROVADO</span>
          </div>
        </div>

        {/* Rodapé e Agradecimento */}
        <div className="text-center pt-3 text-[10px] text-zinc-600 space-y-1">
          <p className="font-semibold text-zinc-800">
            Obrigado pela preferência!
          </p>
          <p>Volte sempre à RD Fitness</p>
          <p className="text-[9px] text-zinc-400 pt-1">
            Emitido via Sistema PDV RD Fitness
          </p>
        </div>
      </div>
    );
  },
);

PdvReceipt.displayName = "PdvReceipt";

