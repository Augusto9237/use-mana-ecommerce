import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addProductToCart,
  addProductToPdvCart,
} from "@/actions/add-cart-product";

import { getUseCartQueryKey, getUsePdvCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductMutationKey = (productVariantId: string) =>
  ["increase-cart-product-quantity", productVariantId] as const;

export const useIncreaseCartProduct = (
  productVariantId: string,
  size: string,
  pdvUserId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getIncreaseCartProductMutationKey(productVariantId),
    mutationFn: async () => {
      const product = {
        productVariantId,
        size,
        quantity: 1,
      };
      const result = pdvUserId
        ? await addProductToPdvCart(product, pdvUserId)
        : await addProductToCart(product);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pdvUserId
          ? getUsePdvCartQueryKey(pdvUserId)
          : getUseCartQueryKey(),
      });
    },
  });
};
