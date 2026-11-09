import { useQuery } from "@tanstack/react-query";

import { getCart, getPdvCart } from "@/actions/get-cart";

export const getUseCartQueryKey = () => ["cart"] as const;
export const getUsePdvCartQueryKey = (userId?: string | null) =>
  ["pdv-cart", userId] as const;

export const useCart = (params?: {
  initialData?: Awaited<ReturnType<typeof getCart>>;
}) => {
  return useQuery({
    queryKey: getUseCartQueryKey(),
    queryFn: () => getCart(),
    initialData: params?.initialData,
  });
};

export const usePdvCart = (userId?: string | null) => {
  return useQuery({
    queryKey: getUsePdvCartQueryKey(userId),
    queryFn: () => (userId ? getPdvCart(userId) : null),
    enabled: Boolean(userId),
  });
};
