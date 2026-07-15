import crypto from "crypto";

interface UberTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface UberQuoteResponse {
  id: string;
  fee: number; // em BRL (geralmente reais, ex: 15.50)
  currency: string;
  pickup_eta: string;
  dropoff_eta: string;
  duration: number; // em minutos
  expires_at: string;
}

interface UberDeliveryResponse {
  id: string;
  status: string;
  pickup_eta: string;
  dropoff_eta: string;
  fee: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function normalizeUberPhoneNumber(phone: string): string {
  const trimmed = phone.trim();

  if (!trimmed) {
    throw new Error("Número de telefone vazio para a Uber");
  }

  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    throw new Error("Número de telefone inválido para a Uber");
  }

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.startsWith("55") && digits.length > 11) {
    return `+${digits}`;
  }

  return `+55${digits}`;
}

function getUberErrorMessage(rawError: string): string {
  try {
    const parsed = JSON.parse(rawError) as { code?: string; message?: string };

    if (parsed?.code === "customer_blocked") {
      return "A conta/organização da Uber configurada não está autorizada para esta ação. Verifique UBER_CUSTOMER_ID e a permissão da conta no Uber Direct.";
    }

    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    // Ignora e usa o texto bruto se não for JSON válido.
  }

  return rawError;
}

/**
 * Obtém o token de autenticação OAuth2 da Uber.
 * Faz cache do token em memória enquanto estiver válido.
 */
export async function getUberAuthToken(): Promise<string> {
  const clientId = process.env.UBER_CLIENT_ID;
  const clientSecret = process.env.UBER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais da Uber (UBER_CLIENT_ID, UBER_CLIENT_SECRET) não configuradas no .env");
  }

  const now = Date.now();
  // Se o token estiver em cache e faltar mais de 5 minutos para expirar, use-o
  if (cachedToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  console.log("Uber Client: Buscando novo token de acesso OAuth2...");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "client_credentials");
  params.append("scope", "eats.deliveries");

  const response = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro na autenticação com a Uber:", errorText);
    throw new Error(`Falha na autenticação da Uber: ${response.statusText}`);
  }

  const data = (await response.json()) as UberTokenResponse;
  cachedToken = data.access_token;
  // Define expiração com margem de segurança
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

/**
 * Solicita uma cotação de entrega (frete) para a Uber Direct.
 */
export async function getUberDeliveryQuote(params: {
  dropoffAddress: string;
  dropoffPhoneNumber: string;
  manifestTotalValueInCents: number;
}): Promise<UberQuoteResponse> {
  const token = await getUberAuthToken();
  const customerId = process.env.UBER_CUSTOMER_ID;
  const pickupAddress = process.env.UBER_PICKUP_ADDRESS;
  const pickupLatitude = parseFloat(process.env.UBER_PICKUP_LATITUDE || "0");
  const pickupLongitude = parseFloat(process.env.UBER_PICKUP_LONGITUDE || "0");
  const pickupPhone = process.env.UBER_PICKUP_PHONE;

  if (!customerId || !pickupAddress || !pickupPhone) {
    throw new Error("Configurações do ponto de retirada da Uber (UBER_CUSTOMER_ID, UBER_PICKUP_ADDRESS, UBER_PICKUP_PHONE) ausentes no .env");
  }

  console.log(`Uber Client: Solicitando cotação para ${params.dropoffAddress}`);

  const normalizedPickupPhone = normalizeUberPhoneNumber(pickupPhone);
  const normalizedDropoffPhone = normalizeUberPhoneNumber(params.dropoffPhoneNumber);

  const body = {
    pickup_address: pickupAddress,
    pickup_latitude: pickupLatitude !== 0 ? pickupLatitude : undefined,
    pickup_longitude: pickupLongitude !== 0 ? pickupLongitude : undefined,
    pickup_phone_number: normalizedPickupPhone,
    dropoff_address: params.dropoffAddress,
    dropoff_phone_number: normalizedDropoffPhone,
    manifest_total_value: params.manifestTotalValueInCents,
  };

  const response = await fetch(`https://api.uber.com/v1/customers/${customerId}/delivery_quotes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = getUberErrorMessage(errorText);
    console.error("Erro ao obter cotação da Uber:", errorMessage);
    throw new Error(`Falha ao obter cotação da Uber: ${errorMessage}`);
  }

  const quote = (await response.json()) as UberQuoteResponse;
  return quote;
}

/**
 * Cria/Agenda a entrega definitiva na Uber Direct associada a uma cotação (quote_id).
 */
export async function createUberDelivery(params: {
  quoteId: string;
  externalOrderId: string;
  dropoffName: string;
  dropoffAddress: string;
  dropoffPhoneNumber: string;
  manifestItems: Array<{
    name: string;
    quantity: number;
    size?: string; // "small" | "medium" | "large" | "xlarge"
    price?: number; // em centavos
  }>;
}): Promise<UberDeliveryResponse> {
  const token = await getUberAuthToken();
  const customerId = process.env.UBER_CUSTOMER_ID;
  const pickupAddress = process.env.UBER_PICKUP_ADDRESS;
  const pickupPhone = process.env.UBER_PICKUP_PHONE;
  const pickupBusinessName = process.env.UBER_PICKUP_BUSINESS_NAME || "RD Fitness";
  const pickupContactName = process.env.UBER_PICKUP_CONTACT_NAME || "Expedição";
  const pickupLatitude = parseFloat(process.env.UBER_PICKUP_LATITUDE || "0");
  const pickupLongitude = parseFloat(process.env.UBER_PICKUP_LONGITUDE || "0");

  if (!customerId || !pickupAddress || !pickupPhone) {
    throw new Error("Configurações do ponto de retirada da Uber ausentes no .env");
  }

  console.log(`Uber Client: Criando entrega na Uber para o pedido ${params.externalOrderId}...`);

  const normalizedPickupPhone = normalizeUberPhoneNumber(pickupPhone);
  const normalizedDropoffPhone = normalizeUberPhoneNumber(params.dropoffPhoneNumber);

  const body = {
    quote_id: params.quoteId,
    external_order_id: params.externalOrderId,
    pickup_name: pickupContactName,
    pickup_address: pickupAddress,
    pickup_phone_number: normalizedPickupPhone,
    pickup_business_name: pickupBusinessName,
    pickup_latitude: pickupLatitude !== 0 ? pickupLatitude : undefined,
    pickup_longitude: pickupLongitude !== 0 ? pickupLongitude : undefined,
    dropoff_name: params.dropoffName,
    dropoff_address: params.dropoffAddress,
    dropoff_phone_number: normalizedDropoffPhone,
    manifest_items: params.manifestItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      size: item.size || "medium",
      price: item.price,
    })),
  };

  const response = await fetch(`https://api.uber.com/v1/customers/${customerId}/deliveries`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = getUberErrorMessage(errorText);
    console.error("Erro ao criar entrega na Uber:", errorMessage);
    throw new Error(`Falha ao criar entrega na Uber: ${errorMessage}`);
  }

  return (await response.json()) as UberDeliveryResponse;
}

/**
 * Cancela uma entrega em andamento na Uber Direct.
 */
export async function cancelUberDelivery(deliveryId: string): Promise<void> {
  const token = await getUberAuthToken();
  const customerId = process.env.UBER_CUSTOMER_ID;

  if (!customerId) {
    throw new Error("UBER_CUSTOMER_ID não configurado no .env");
  }

  console.log(`Uber Client: Cancelando entrega ${deliveryId}...`);

  const response = await fetch(`https://api.uber.com/v1/customers/${customerId}/deliveries/${deliveryId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao cancelar entrega na Uber:", errorText);
    throw new Error(`Falha ao cancelar entrega na Uber: ${errorText}`);
  }
}

/**
 * Consulta as informações de uma entrega na Uber Direct.
 */
export async function getUberDeliveryStatus(deliveryId: string): Promise<UberDeliveryResponse> {
  const token = await getUberAuthToken();
  const customerId = process.env.UBER_CUSTOMER_ID;

  if (!customerId) {
    throw new Error("UBER_CUSTOMER_ID não configurado no .env");
  }

  const response = await fetch(`https://api.uber.com/v1/customers/${customerId}/deliveries/${deliveryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao obter status da entrega na Uber:", errorText);
    throw new Error(`Falha ao consultar entrega na Uber: ${errorText}`);
  }

  return (await response.json()) as UberDeliveryResponse;
}

/**
 * Verifica se a assinatura do Webhook recebida do Uber é legítima.
 */
export function verifyUberWebhookSignature(rawBody: string, signature: string): boolean {
  const signingKey = process.env.UBER_WEBHOOK_SIGNING_KEY;
  if (!signingKey) {
    console.warn("UBER_WEBHOOK_SIGNING_KEY não configurada no .env. Ignorando validação de assinatura.");
    return true; // Retorna true para evitar rejeição por falta de chave em ambiente de testes
  }

  const hmac = crypto.createHmac("sha256", signingKey);
  const calculatedSignature = hmac.update(rawBody).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(signature));
}
