"use client";

import { useState } from "react";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, Shield, User } from "lucide-react";

import { createUser } from "@/actions/create-user";
import { createShippingAddressSchema } from "@/actions/create-shipping-address/schema";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

const addressFieldsSchema = createShippingAddressSchema
  .omit({ email: true, fullName: true })
  .partial();

const formSchema = z
  .object({
    email: z.email("E-mail inválido!"),
    name: z.string("Nome inválido!").min(3, "Nome inválido!"),
    role: z.enum(["user", "admin"], "Selecione um papel válido!"),
    createAddress: z.boolean(),
    address: addressFieldsSchema,
  })
  .superRefine((values, context) => {
    if (!values.createAddress) return;

    const result = createShippingAddressSchema.safeParse({
      ...values.address,
      email: values.email,
      fullName: values.name,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "email" || issue.path[0] === "fullName") continue;
        context.addIssue({
          code: "custom",
          path: ["address", ...issue.path],
          message: issue.message,
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

export function CreateUserForm({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "user",
      createAddress: false,
      address: {
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
    },
  });
  async function onSubmit(values: FormValues) {
    try {
      const result = await createUser({
        email: values.email,
        password: "12345678",
        name: values.name,
        role: values.role,
        address: values.createAddress
          ? {
              cpf: values.address.cpf ?? "",
              phone: values.address.phone ?? "",
              zipCode: values.address.zipCode ?? "",
              address: values.address.address ?? "",
              number: values.address.number ?? "",
              complement: values.address.complement ?? "",
              neighborhood: values.address.neighborhood ?? "",
              city: values.address.city ?? "",
              state: values.address.state ?? "",
            }
          : undefined,
      });

      if (!result.success) {
        if (result.userCreated) {
          toast.error(
            "Usuário criado, mas não foi possível salvar o endereço.",
          );
          form.reset();
          setOpen(false);
        } else {
          toast.error(
            "Erro ao criar usuário. Verifique os dados e tente novamente.",
          );
        }
        return;
      }

      toast.success(
        result.addressCreated
          ? "Usuário e endereço criados com sucesso!"
          : "Usuário criado com sucesso!",
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Erro ao criar usuário. Tente novamente.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <Button>
            <Plus />
            Novo Usuário
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle>Criar Usuário</SheetTitle>
          <SheetDescription>
            Preencha os campos abaixo para criar um novo usuário.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              <div className="grid w-full gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">
                            <User /> Cliente
                          </SelectItem>
                          <SelectItem value="admin">
                            <Shield /> Administrador
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="createAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Adicionar endereço</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Cadastre também o endereço de entrega do cliente.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("createAddress") && (
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="address.cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="###.###.###-##"
                            placeholder="000.000.000-00"
                            customInput={Input}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Celular</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="(##) #####-####"
                            placeholder="(11) 99999-9999"
                            customInput={Input}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="#####-###"
                            placeholder="00000-000"
                            customInput={Input}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o endereço"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o número"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apto, bloco, etc. (opcional)"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o bairro"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite a cidade"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o estado"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            <SheetFooter className="border-t p-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Criando..." : "Criar conta"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
