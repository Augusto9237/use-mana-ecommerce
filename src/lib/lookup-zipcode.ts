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

  const data: unknown = await response.json();

  if (data === null || typeof data !== "object") {
    throw new Error("Resposta inválida da API de CEP.");
  }

  if ("erro" in data && data.erro === true) {
    throw new Error("CEP não encontrado.");
  }

  if (
    !("localidade" in data) ||
    typeof data.localidade !== "string" ||
    !("uf" in data) ||
    typeof data.uf !== "string"
  ) {
    throw new Error("Resposta inválida da API de CEP.");
  }

  if(data.uf !== "PA") {
    throw new Error("CEP não pertence ao estado do Pará. Apenas CEPs do estado do Pará são aceitos.");
  }

  return {
    transportadora: data.localidade === "São Sebastião da Boa Vista"? "Motoboy" : "Barco",
    valorFrete: data.localidade === "São Sebastião da Boa Vista"? 500 : 1000,
  }
}
