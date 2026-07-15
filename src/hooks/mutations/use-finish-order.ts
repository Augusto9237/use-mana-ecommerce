import { useMutation, useQueryClient } from "@tanstack/react-query";

import { finishOrder } from "@/actions/finish-order";
import { FinishOrderSchema } from "@/actions/finish-order/schema";

import { getUseCartQueryKey } from "../queries/use-cart";

export const getUseFinishOrderMutationKey = () => ["finish-order"];

export const useFinishOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getUseFinishOrderMutationKey(),
    mutationFn: async (variables?: FinishOrderSchema) => {
      return await finishOrder(variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
