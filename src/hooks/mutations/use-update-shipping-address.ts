import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateShippingAddress } from "@/actions/update-shipping-address";

import { getUserAddressesQueryKey } from "../queries/use-user-addresses";

export const getUpdateShippingAddressMutationKey = () =>
  ["update-shipping-address"] as const;

export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getUpdateShippingAddressMutationKey(),
    mutationFn: updateShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserAddressesQueryKey(),
      });
    },
  });
};
