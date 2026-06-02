import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { formatAddress } from "../../helpers/address";
import z from "zod";
import { useCreateShippingAddress } from "@/hooks/mutations/use-create-shipping-address"
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address"
import { useUserAddresses } from "@/hooks/queries/use-user-addresses"
import { shippingAddressTable } from "@/db/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PatternFormat } from "react-number-format"
import { Plus, PlusCircle } from "lucide-react"

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

interface AddressesProps {
    shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
    defaultShippingAddressId: string | null;
}

export function FormAddress() {

    const createShippingAddressMutation = useCreateShippingAddress();
    const updateCartShippingAddressMutation = useUpdateCartShippingAddress();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            fullName: "",
            cpf: "",
            phone: "",
            zipCode: "",
            address: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const newAddress =
                await createShippingAddressMutation.mutateAsync(values);
            toast.success("Endereço criado com sucesso!");
            form.reset();

            await updateCartShippingAddressMutation.mutateAsync({
                shippingAddressId: newAddress.id,
            });
            toast.success("Endereço vinculado ao carrinho!");
        } catch (error) {
            toast.error("Erro ao criar endereço. Tente novamente.");
            console.error(error);
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary"><PlusCircle />
                    <span className="max-sm:hidden">Novo</span> Endereço</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[94dvh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Endereço de entrega
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
                                disabled={
                                    createShippingAddressMutation.isPending ||
                                    updateCartShippingAddressMutation.isPending
                                }
                            >
                                {createShippingAddressMutation.isPending ||
                                    updateCartShippingAddressMutation.isPending
                                    ? "Salvando..."
                                    : "Salvar endereço"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>

        </Dialog >
    )
}
