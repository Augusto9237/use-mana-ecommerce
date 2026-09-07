export const formatCentsToBRL = (cents?: number | null) => {
  if (cents == null || Number.isNaN(Number(cents))) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(cents) / 100);
};

export const formatCentsToInteger = (cents?: number | null) => {
  if (cents == null || Number.isNaN(Number(cents))) {
    return 0;
  }
  return Math.floor(Number(cents) / 100);
};

export const formatIntegerToCents = (integer?: number | null) => {
  if (integer == null || Number.isNaN(Number(integer))) {
    return 0;
  }
  return Math.round(Number(integer) * 100);
};