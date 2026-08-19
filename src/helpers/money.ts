export const formatCentsToBRL = (cents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export const formatCentsToInteger = (cents: number) => {
  return Math.floor(cents / 100);
};

export const formatIntegerToCents = (integer: number) => {
  return integer * 100;
}