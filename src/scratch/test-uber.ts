/**
 * Script de teste da integração Uber Direct
 *
 * Executa:
 *   npx tsx src/scratch/test-uber.ts
 *
 * Certifique-se de que o arquivo .env está preenchido corretamente antes de rodar.
 */
import "dotenv/config";

async function getToken(): Promise<string> {
  const clientId = process.env.UBER_CLIENT_ID;
  const clientSecret = process.env.UBER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("UBER_CLIENT_ID e UBER_CLIENT_SECRET são obrigatórios no .env");
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "client_credentials");
  params.append("scope", "eats.deliveries");

  const res = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Erro na autenticação: ${JSON.stringify(data)}`);
  }

  console.log("✅ Token obtido com sucesso!");
  console.log("   Token type:", data.token_type);
  console.log("   Expira em:", data.expires_in, "segundos");
  return data.access_token;
}

async function testQuote(token: string): Promise<string | null> {
  const customerId = process.env.UBER_CUSTOMER_ID;
  const pickupAddress = process.env.UBER_PICKUP_ADDRESS;
  const pickupPhone = process.env.UBER_PICKUP_PHONE;

  if (!customerId || !pickupAddress || !pickupPhone) {
    console.warn("⚠️  UBER_CUSTOMER_ID, UBER_PICKUP_ADDRESS ou UBER_PICKUP_PHONE ausentes. Pulando teste de cotação.");
    return null;
  }

  // Endereço de teste (destino fictício)
  const dropoffAddress = "Rua 25 de Março, 123 - Centro, São Paulo - SP, 01021-100, Brasil";

  const body = {
    pickup_address: pickupAddress,
    pickup_phone_number: pickupPhone,
    dropoff_address: dropoffAddress,
    dropoff_phone_number: "+5511888888888",
    manifest_total_value: 15000, // R$ 150,00 em centavos
  };

  console.log("\n📦 Solicitando cotação de entrega...");
  console.log("   Origem:", pickupAddress);
  console.log("   Destino:", dropoffAddress);

  const res = await fetch(`https://api.uber.com/v1/customers/${customerId}/delivery_quotes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Erro ao obter cotação:", JSON.stringify(data, null, 2));
    return null;
  }

  console.log("✅ Cotação obtida com sucesso!");
  console.log("   Quote ID:", data.id);
  console.log("   Taxa (fee):", data.fee, data.currency);
  console.log("   Duração estimada:", data.duration, "minutos");
  console.log("   Expira em:", data.expires_at);

  return data.id;
}

async function main() {
  console.log("🚀 Iniciando testes da integração Uber Direct...\n");

  try {
    const token = await getToken();
    await testQuote(token);
    console.log("\n✅ Todos os testes concluídos com sucesso!");
  } catch (err: any) {
    console.error("\n❌ Falha nos testes:", err.message);
    process.exit(1);
  }
}

main();
