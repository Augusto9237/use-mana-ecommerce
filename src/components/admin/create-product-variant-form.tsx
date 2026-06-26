"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProductVariant } from "@/actions/create-product";
import {
  CreateProductVariantSchema,
  createProductVariantSchema,
} from "@/actions/create-product/schema";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger, Sheet, SheetFooter } from "../ui/sheet";
import { Plus } from "lucide-react";

interface CreateProductVariantFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function CreateProductVariantForm({
  productId,
  onSuccess,
}: CreateProductVariantFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateProductVariantSchema>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      productId,
      name: "",
      slug: "",
      size: "",
      color: "",
      priceInCents: 0,
      imageUrl: "",
    },
  });

  async function onSubmit(data: CreateProductVariantSchema) {
    setIsLoading(true);
    try {
      await createProductVariant(data);
      toast.success("Variante criada com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar variante";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus />
          Nova Variante
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-lg">
        <SheetHeader>
          <SheetTitle>Criar Variante</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Variante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Fone Preto"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="fone-preto"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL amigável para a variante (use hífens)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Preto"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='size'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: M"
                      disabled={isLoading}
                      type="text"
                      {...field}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceInCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (em centavos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="9999"
                      disabled={isLoading}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: 9999 = R$ 99,99
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="p-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Variante"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
