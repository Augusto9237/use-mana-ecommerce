import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { cancelCheckoutPayment } from "@/actions/cancel-mercadopago";
import { cancelCheckoutPaymentSchema } from "@/actions/cancel-mercadopago/schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const parsed = cancelCheckoutPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados da requisição inválidos.",
        details: parsed.error.format(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await cancelCheckoutPayment(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados da requisição inválidos.", details: error.format() },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "";
    const status =
      message === "Não autorizado"
        ? 401
        : message === "Pedido não encontrado" ||
            message === "Nenhum pagamento foi encontrado para este pedido."
          ? 404
          : message.startsWith("Somente ")
            ? 409
            : 502;

    if (status === 502) {
      console.error("[Mercado Pago cancel] Failed to cancel payment:", error);
    }

    return NextResponse.json(
      {
        error:
          status === 502
            ? "Não foi possível cancelar o pagamento junto ao Mercado Pago."
            : message,
      },
      { status },
    );
  }
}
