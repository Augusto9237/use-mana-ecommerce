"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";

import {
  createShippingAddressSchema,
  type CreateShippingAddressSchema,
} from "@/actions/create-shipping-address/schema";
import {
  createPdvShippingAddress,
  updatePdvShippingAddress,
} from "@/actions/pdv";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { shippingAddressTable } from "@/db/schema";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateShippingAddress } from "@/hooks/mutations/use-update-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";

type ShippingAddress = typeof shippingAddressTable.$inferSelect;

type FormValues = CreateShippingAddressSchema;

interface AddressFormProps {
  customerId?: string;
  linkToCart?: boolean;
  customerDefaultInfo?: {
    name?: string;
    email?: string;
    phone?: string | null;
    cpfOrCnpj?: string | null;
  };
  address?: ShippingAddress;
  trigger?: React.ReactNode;
  onSuccess?: (addressId: string) => void;
}

export function AddressForm({
  customerId,
  linkToCart = false,
  customerDefaultInfo,
  address,
  trigger,
  onSuccess,
}: AddressFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!address;
  const createAddressMutation = useCreateShippingAddress();
  const updateAddressMutation = useUpdateShippingAddress();
  const updateCartAddressMutation = useUpdateCartShippingAddress();

  const form = useForm<FormValues>({
    resolver: zodResolver(createShippingAddressSchema),
    defaultValues: {
      email: address?.email ?? customerDefaultInfo?.email ?? "",
      fullName: address?.recipientName ?? customerDefaultInfo?.name ?? "",
      cpf: address?.cpfOrCnpj ?? customerDefaultInfo?.cpfOrCnpj ?? "",
      phone: address?.phone ?? customerDefaultInfo?.phone ?? "",
      zipCode: address?.zipCode ?? "",
      address: address?.street ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
      neighborhood: address?.neighborhood ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      let addressId: string;

      if (customerId) {
        const savedAddress = address
          ? await updatePdvShippingAddress({
              customerId,
              addressId: address.id,
              data: values,
            })
          : await createPdvShippingAddress(values, customerId);
        addressId = savedAddress.id;
      } else if (address) {
        await updateAddressMutation.mutateAsync({ id: address.id, ...values });
        addressId = address.id;
      } else {
        const newAddress = await createAddressMutation.mutateAsync(values);
        addressId = newAddress.id;
        if (linkToCart) {
          await updateCartAddressMutation.mutateAsync({
            shippingAddressId: addressId,
          });
        }
      }

      toast.success(
        isEditing
          ? "Endereço atualizado com sucesso!"
          : "Endereço cadastrado com sucesso!",
      );
      setOpen(false);
      if (isEditing) {
        form.reset(values);
      } else {
        form.reset();
      }
      onSuccess?.(addressId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar endereço.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="icon" className="size-8">
      <Pencil className="size-4" />
      <span className="sr-only">Editar endereço</span>
    </Button>
  ) : (
    <Button variant="secondary" size="sm" type="button">
      <Plus className="mr-1.5 size-4" />
      <span className="max-sm:hidden">Novo</span>
      Endereço
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="flex max-h-[94dvh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar endereço de entrega"
              : "Cadastrar endereço de entrega"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="scroll-fade-y no-scrollbar flex-1 space-y-4 overflow-y-auto py-2 mb-1 pr-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do destinatário</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo para entrega"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seuemail@exemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          placeholder="000.000.000-00"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular / Telefone</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          placeholder="(11) 99999-9999"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          placeholder="00000-000"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro / Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="complement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apto, Bloco, Referência..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SP"
                          maxLength={2}
                          className="uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Salvar endereço"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
