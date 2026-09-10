// app/api/checkout/route.ts
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { preference } from "@/lib/mercadopago";

// ─── Schemas ───────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});

// ─── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_CURRENCY = "BRL";
const AUTO_RETURN = "approved";
const SHIPPING_ITEM_ID = "shipping-uber";

// ─── Custom Errors ───────────────────────────────────────────────────────────
class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderWithItems = NonNullable<Awaited<ReturnType<typeof fetchOrder>>>;

interface MercadoPagoItem {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getBaseUrl(): string {
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;

  const candidates = [
    process.env.NEXT_PUBLIC_URL,
    notificationUrl ? new URL(notificationUrl).origin : undefined,
    process.env.NEXTAUTH_URL,
    "http://localhost:3000",
  ];

  const base = candidates.find(Boolean);
  if (!base) throw new CheckoutError("No base URL configured", 500);

  return base.replace(/\/$/, "");
}

function buildBackUrls(baseUrl: string) {
  return {
    success: `${baseUrl}/api/mercadopago/return/success`,
    failure: `${baseUrl}/api/mercadopago/return/failure`,
    pending: `${baseUrl}/api/mercadopago/return/pending`,
  } as const;
}

function buildOrderItems(order: OrderWithItems): MercadoPagoItem[] {
  const items: MercadoPagoItem[] = order.items.map((item) => ({
    id: item.productVariant.id,
    title: `${item.productVariant.product.name} - ${item.productVariant.name}`,
    description: item.productVariant.product.description ?? undefined,
    picture_url: item.productVariant.imageUrl[0] ?? undefined,
    category_id: item.productVariant.product.categoryId ?? undefined,
    quantity: item.quantity,
    unit_price: item.productVariant.priceInCents / 100,
  }));

  if (order.shippingFeeInCents && order.shippingFeeInCents > 0) {
    items.push({
      id: SHIPPING_ITEM_ID,
      title: "Frete (Uber Direct)",
      description: "Entrega expressa via Uber Direct",
      picture_url: undefined,
      category_id: "shipping",
      quantity: 1,
      unit_price: order.shippingFeeInCents / 100,
    });
  }

  return items;
}

function buildPreferencePayload(
  items: MercadoPagoItem[],
  orderId: string,
  sessionUser: { email?: string | null; name?: string | null },
) {
  const baseUrl = getBaseUrl();
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;

  return {
    items,
    payer: {
      email: sessionUser.email ?? undefined,
      name: sessionUser.name ?? undefined,
    },
    back_urls: buildBackUrls(baseUrl),
    currency_id: process.env.MERCADOPAGO_CURRENCY || DEFAULT_CURRENCY,
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    external_reference: orderId,
    auto_return: AUTO_RETURN,
  };
}

// ─── Data Access ─────────────────────────────────────────────────────────────
async function fetchOrder(orderId: string) {
  return db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
      user: {
        columns: {
          email: true,
          name: true,
        },
      },
    },
  });
}

// ─── Use Case ────────────────────────────────────────────────────────────────
async function createCheckoutSession(orderId: string, userId: string) {
  const order = await fetchOrder(orderId);

  if (!order) {
    throw new CheckoutError("Order not found", 404);
  }

  if (order.userId !== userId) {
    throw new CheckoutError("Forbidden", 403);
  }

  if (!order.items?.length) {
    throw new CheckoutError("Order has no items", 400);
  }

  const items = buildOrderItems(order);
  const payload = buildPreferencePayload(items, orderId, {
    email: order.user?.email,
    name: order.user?.name,
  });

  const response = await preference.create({ body: payload });

  const initPoint = response.sandbox_init_point || response.init_point;
  const environment = response.sandbox_init_point ? "sandbox" : "production";

  console.log(`[MercadoPago] Using ${environment} init_point:`, initPoint);

  return {
    initPoint,
    preferenceId: response.id,
  };
}

// ─── CORS ───────────────────────────────────────────────────────────────────
function getAllowedOrigins(): string[] {
  const allowed = [
    process.env.NEXT_PUBLIC_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[];

  if (process.env.ALLOWED_ORIGINS) {
    allowed.push(
      ...process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
    );
  }

  return allowed.map((origin) => origin.replace(/\/$/, ""));
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && allowedOrigins.includes(origin.replace(/\/$/, ""));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0] || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

function validateOrigin(req: NextRequest): {
  isAllowed: boolean;
  origin: string | null;
} {
  const origin = req.headers.get("origin");

  // If no origin header is sent (e.g. server-to-server or direct requests), allow it
  if (!origin) {
    return { isAllowed: true, origin: null };
  }

  const allowedOrigins = getAllowedOrigins();
  const isAllowed = allowedOrigins.includes(origin.replace(/\/$/, ""));

  return { isAllowed, origin };
}

// ─── Route Handlers ──────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  const { isAllowed, origin } = validateOrigin(req);

  if (!isAllowed) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const { isAllowed, origin } = validateOrigin(req);

  if (!isAllowed) {
    return NextResponse.json({ error: "CORS not allowed" }, { status: 403 });
  }

  const corsHeaders = getCorsHeaders(origin);

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400, headers: corsHeaders },
      );
    }

    const result = await createCheckoutSession(
      parsed.data.orderId,
      session.user.id,
    );

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode, headers: corsHeaders },
      );
    }

    console.error("[Checkout] Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders },
    );
  }
}