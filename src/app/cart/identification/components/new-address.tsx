"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Pencil, Plus } from "lucide-react";
import { PatternFormat } from "react-number-format";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { shippingAddressTable } from "@/db/schema";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateShippingAddress } from "@/hooks/mutations/use-update-shipping-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
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

type ShippingAddress = typeof shippingAddressTable.$inferSelect;

const formSchema = z.object({
    email: z.email("E-mail inválido"),
    fullName: z.string().min(1, "Nome completo é obrigatório"),
    cpf: z.string().min(14, "CPF inválido"),
    phone: z.string().min(15, "Celular inválido"),
    zipCode: z.string().min(9, "CEP inválido"),
    address: z.string().min(1, "Endereço é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface FormAddressProps {
    /** When provided the form will act as an edit form, pre-filled with the address data. */
    address?: ShippingAddress;
    /** Custom trigger element. Defaults to an icon button when editing, or a "Novo Endereço" button when creating. */
    trigger?: React.ReactNode;
    /** Called after a successful create or update. */
    onSuccess?: () => void;
}

export function FormAddress({ address, trigger, onSuccess }: FormAddressProps) {
    const isEditing = !!address;

    const createShippingAddressMutation = useCreateShippingAddress();
    const updateShippingAddressMutation = useUpdateShippingAddress();
    const updateCartShippingAddressMutation = useUpdateCartShippingAddress();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: address?.email ?? "",
            fullName: address?.recipientName ?? "",
            cpf: address?.cpfOrCnpj ?? "",
            phone: address?.phone ?? "",
            zipCode: address?.zipCode ?? "",
            address: address?.street ?? "",
            number: address?.number ?? "",
            complement: address?.complement ?? "",
            neighborhood: address?.neighborhood ?? "",
            city: address?.city ?? "",
            state: address?.state ?? "",
        },
    });

    const isPending =
        createShippingAddressMutation.isPending ||
        updateShippingAddressMutation.isPending ||
        updateCartShippingAddressMutation.isPending;

    const onSubmit = async (values: FormValues) => {
        try {
            if (isEditing) {
                await updateShippingAddressMutation.mutateAsync({
                    id: address.id,
                    ...values,
                });
                toast.success("Endereço atualizado com sucesso!");
            } else {
                const newAddress =
                    await createShippingAddressMutation.mutateAsync(values);
                toast.success("Endereço criado com sucesso!");
                form.reset();

                await updateCartShippingAddressMutation.mutateAsync({
                    shippingAddressId: newAddress.id,
                });
                toast.success("Endereço vinculado ao carrinho!");
            }

            onSuccess?.();
        } catch (error) {
            toast.error(
                isEditing
                    ? "Erro ao atualizar endereço. Tente novamente."
                    : "Erro ao criar endereço. Tente novamente.",
            );
            console.error(error);
        }
    };

    const defaultTrigger = isEditing ? (
        <Button variant="ghost" size="icon" className="size-8">
            <Pencil className="size-4" />
            <span className="sr-only">Editar endereço</span>
        </Button>
    ) : (
        <Button variant="secondary">
            <Plus />
            Novo Endereço
        </Button>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger ?? defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-h-[94dvh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar endereço" : "Endereço de entrega"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome completo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Digite seu nome completo"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Celular</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Endereço</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite seu endereço" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o número" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="complement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Apto, bloco, etc. (opcional)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="neighborhood"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bairro</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o bairro" {...field} />
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
                                            <Input placeholder="Digite a cidade" {...field} />
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
                                        <FormLabel>Estado</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o estado" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending}
                            >
                                {isPending
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
