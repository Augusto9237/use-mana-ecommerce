'use client';

import { createUser } from "@/actions/create-user";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Plus, Shield, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const formSchema = z.object({
    email: z.email("E-mail inválido!"),
    name: z.string("Nome inválido!").min(3, "Nome inválido!"),
    role: z.enum(["user", "admin"], "Selecione um papel válido!"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateUserForm({children}: {children: React.ReactNode}) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            name: "",
            role: "user",
        },
    });
    async function onSubmit(values: FormValues) {
        await createUser({
            email: values.email,
            password: "12345678",
            name: values.name,
            role: values.role
        })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children ? children : <Button><Plus/>Novo Usuário</Button>}
            </SheetTrigger>
            <SheetContent className="gap-0">
                <SheetHeader>
                    <SheetTitle>Criar Usuário</SheetTitle>
                    <SheetDescription>
                        Preencha os campos abaixo para criar um novo usuário.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid w-full gap-6 p-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Usuário</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione um papel" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="user"><User /> Cliente</SelectItem>
                                                <SelectItem value="admin"><Shield /> Administrador</SelectItem>
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
                        <SheetFooter>
                            <Button type="submit">Criar conta</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}