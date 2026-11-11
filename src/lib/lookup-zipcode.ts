import { z } from "zod";

const viaCepResponseSchema = z.union([
  z.object({ erro: z.literal(true) }),
  z.object({
    localidade: z.string(),
    uf: z.string(),
  }),
]);

export async function lookupZipcode(
  cep: string,
): Promise<{ transportadora: string; valorFrete: number }> {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("CEP inválido. O CEP deve conter 8 dígitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

  if (!response.ok) {
    throw new Error("Erro ao consultar a API de CEP.");
  }

  const data = viaCepResponseSchema.parse(await response.json());
  if ("erro" in data) {
    throw new Error("CEP não encontrado.");
  }

  if (data.uf !== "PA") {
    throw new Error(
      "CEP não pertence ao estado do Pará. Apenas CEPs do estado do Pará são aceitos.",
    );
  }

  const isSaoSebastiaoDaBoaVista = data.localidade === "São Sebastião da Boa Vista";

  return {
    transportadora: isSaoSebastiaoDaBoaVista ? "Motoboy" : "Barco",
    valorFrete: isSaoSebastiaoDaBoaVista ? 500 : 1000,
  };
}
