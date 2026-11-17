"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { SignInForm } from "@/components/common/sign-in-form";
import { SignUpForm } from "@/components/common/sign-up-form";

type GoogleAuthDialogProps = {
    title?: string;
    description?: string;
};


const signInSchema = z.object({
    email: z.email("E-mail inválido."),
    password: z.string("Senha inválida.").min(8, "Senha inválida."),
});

const signUpSchema = z
    .object({
        name: z.string("Nome inválido.").trim().min(1, "Nome é obrigatório."),
        email: z.email("E-mail inválido."),
        password: z.string("Senha inválida.").min(8, "Senha inválida."),
        passwordConfirmation: z.string("Senha inválida.").min(8, "Senha inválida."),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        error: "As senhas não coincidem.",
        path: ["passwordConfirmation"],
    });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

type AuthenticationModalProps = {
    title?: string;
    description?: string;
};

export function AuthenticationModal({
    title = "Acesse sua conta",
    description = "Entre ou crie uma conta para continuar.",
}: AuthenticationModalProps) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    // const signInForm = useForm<SignInValues>({
    //     resolver: zodResolver(signInSchema),
    //     defaultValues: { email: "", password: "" },
    // });
    // const signUpForm = useForm<SignUpValues>({
    //     resolver: zodResolver(signUpSchema),
    //     defaultValues: {
    //         name: "",
    //         email: "",
    //         password: "",
    //         passwordConfirmation: "",
    //     },
    // });

    // async function onSignIn(values: SignInValues) {
    //     await authClient.signIn.email({
    //         email: values.email,
    //         password: values.password,
    //         fetchOptions: {
    //             onSuccess: () => {
    //                 setOpen(false);
    //                 router.push("/");
    //             },
    //             onError: ({ error }) => {
    //                 if (error.code === "USER_NOT_FOUND") {
    //                     toast.error("E-mail não encontrado.");
    //                     return signInForm.setError("email", {
    //                         message: "E-mail não encontrado.",
    //                     });
    //                 }
    //                 if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
    //                     toast.error("E-mail ou senha inválidos.");
    //                     signInForm.setError("email", {
    //                         message: "E-mail ou senha inválidos.",
    //                     });
    //                     return signInForm.setError("password", {
    //                         message: "E-mail ou senha inválidos.",
    //                     });
    //                 }
    //                 toast.error(error.message);
    //             },
    //         },
    //     });
    // }

    // async function onSignUp(values: SignUpValues) {
    //     await authClient.signUp.email({
    //         name: values.name,
    //         email: values.email,
    //         password: values.password,
    //         fetchOptions: {
    //             onSuccess: () => {
    //                 setOpen(false);
    //                 router.push("/");
    //             },
    //             onError: ({ error }) => {
    //                 if (error.code === "USER_ALREADY_EXISTS") {
    //                     toast.error("E-mail já cadastrado.");
    //                     return signUpForm.setError("email", {
    //                         message: "E-mail já cadastrado.",
    //                     });
    //                 }
    //                 toast.error(error.message);
    //             },
    //         },
    //     });
    // }

    async function handleSignInWithGoogle() {
        setIsGoogleLoading(true);
        try {
            await authClient.signIn.social({
                provider: "google"
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Entrar ou criar conta">
                    <LogInIcon />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl grid md:grid-cols-2 p-0 overflow-hidden gap-0">
                <div className="flex flex-col flex-1 gap-5 p-5">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="sign-in" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sign-in">Entrar</TabsTrigger>
                            <TabsTrigger value="sign-up">Criar conta</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sign-in" className="mt-5">
                            <SignInForm />
                        </TabsContent>

                        <TabsContent value="sign-up" className="mt-5">
                            {/* <Form {...signUpForm}>
                            <form onSubmit={signUpForm.handleSubmit(onSignUp)}>
                                <FieldGroup className="gap-4">
                                    <FormField
                                        control={signUpForm.control}
                                        name="name"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="sign-up-name">Nome</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="sign-up-name"
                                                    autoComplete="name"
                                                    placeholder="Digite seu nome"
                                                    aria-invalid={fieldState.invalid}
                                                    aria-describedby={fieldState.error ? "sign-up-name-error" : undefined}
                                                />
                                                <FieldError id="sign-up-name-error" errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                    <FormField
                                        control={signUpForm.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="sign-up-email">E-mail</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="sign-up-email"
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder="Digite seu e-mail"
                                                    aria-invalid={fieldState.invalid}
                                                    aria-describedby={fieldState.error ? "sign-up-email-error" : undefined}
                                                />
                                                <FieldError id="sign-up-email-error" errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                    <FormField
                                        control={signUpForm.control}
                                        name="password"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="sign-up-password">Senha</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="sign-up-password"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    placeholder="Mínimo de 8 caracteres"
                                                    aria-invalid={fieldState.invalid}
                                                    aria-describedby={fieldState.error ? "sign-up-password-error" : undefined}
                                                />
                                                <FieldError id="sign-up-password-error" errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                    <FormField
                                        control={signUpForm.control}
                                        name="passwordConfirmation"
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="sign-up-password-confirmation">Confirmar senha</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="sign-up-password-confirmation"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    placeholder="Digite sua senha novamente"
                                                    aria-invalid={fieldState.invalid}
                                                    aria-describedby={fieldState.error ? "sign-up-password-confirmation-error" : undefined}
                                                />
                                                <FieldError
                                                    id="sign-up-password-confirmation-error"
                                                    errors={[fieldState.error]}
                                                />
                                            </Field>
                                        )}
                                    />
                                    <FieldDescription>
                                        A senha deve ter pelo menos 8 caracteres.
                                    </FieldDescription>
                                    <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                                        {signUpForm.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </Form> */}
                            <SignUpForm />
                        </TabsContent>
                    </Tabs>

                    <FieldSeparator className="bg-card">Ou continue com</FieldSeparator>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleSignInWithGoogle}
                        type="button"
                        disabled={isGoogleLoading}
                    >
                        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {isGoogleLoading ? "Conectando..." : "Continuar com Google"}
                    </Button>
                </div>
                <div className="relative hidden bg-muted md:block">
                    <img
                        src="/logo.png"
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-contain object-center p-20"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}



