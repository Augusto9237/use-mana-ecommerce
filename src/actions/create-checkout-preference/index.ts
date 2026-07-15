"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable, cartTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { preference } from "@/lib/mercadopago";

import {
  CreateCheckoutPreferenceSchema,
  createCheckoutPreferenceSchema,
} from "./schema";

export const createCheckoutPreference = async (
  data: CreateCheckoutPreferenceSchema,
) => {
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;
  if (!notificationUrl) {
    console.warn(
      "MERCADOPAGO_NOTIFICATION_URL not set — webhooks disabled (use ngrok for local testing)",
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { orderId } = createCheckoutPreferenceSchema.parse(data);

  // Fetch order and verify ownership
  const order = await db.query.orderTable.findFirst({
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
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (!order.items || order.items.length === 0) {
    throw new Error("Order has no items");
  }

  // Build items for Preference from order
  const items = order.items.map((oi) => ({
    id: oi.productVariant.id,
    title: `${oi.productVariant.product.name} - ${oi.productVariant.name}`,
    description: oi.productVariant.product.description,
    picture_url: oi.productVariant.imageUrl,
    category_id: oi.productVariant.product.categoryId,
    quantity: oi.quantity,
    unit_price: oi.productVariant.priceInCents / 100,
  }));

  if (order.shippingFeeInCents && order.shippingFeeInCents > 0) {
    items.push({
      id: "shipping-uber",
      title: "Frete (Uber Direct)",
      description: "Entrega expressa via Uber Direct",
      picture_url: "",
      category_id: "shipping",
      quantity: 1,
      unit_price: order.shippingFeeInCents / 100,
    });
  }

  // Calculate total
  const totalInCents = order.items.reduce(
    (sum, item) => sum + item.productVariant.priceInCents * item.quantity,
    0,
  );

  try {
    // Build back URLs with a safe fallback. Prefer explicit public URL for webhooks/tunnels.
    const resolveBaseFromNotification = (url?: string) => {
      if (!url) return undefined;
      try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}`;
      } catch (e) {
        return undefined;
      }
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      resolveBaseFromNotification(notificationUrl) ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    console.log("Using baseUrl for MercadoPago back_urls:", baseUrl);

    const back_urls = {
      success: `${baseUrl.replace(/\/$/, "")}/checkout/success`,
      failure: `${baseUrl.replace(/\/$/, "")}/cart`,
      pending: `${baseUrl.replace(/\/$/, "")}/cart`,
    };

    const preferenceBody: any = {
      items,
      payer: {
        email: session.user.email || undefined,
        name: session.user.name || undefined,
      },
      back_urls,
      currency_id: process.env.MERCADOPAGO_CURRENCY || "BRL",
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      external_reference: `order-${orderId}`,
      auto_return: "approved",
    };

    console.log("Creating Mercado Pago preference body:", JSON.stringify(preferenceBody));

    // Create preference
    const preferenceResponse = await preference.create({ body: preferenceBody });

    // Prefer sandbox_init_point when provided by Mercado Pago (useful when testing)
    const initPoint = preferenceResponse.sandbox_init_point || preferenceResponse.init_point;
    const usedEnv = preferenceResponse.sandbox_init_point ? "sandbox" : "production";
    console.log(`Using ${usedEnv} init_point:`, initPoint);

    return {
      initPoint,
      preferenceId: preferenceResponse.id,
    };
  } catch (error) {
    // Log detailed error for debugging
    try {
      console.error("Error creating Mercado Pago preference:", {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        response: (error as any)?.response || (error as any)?.cause || null,
        errorObject: error,
      });
    } catch (e) {
      console.error("Error logging Mercado Pago error", e);
    }
    // Re-throw the original error to preserve context for upstream handlers
    throw error;
  }
};