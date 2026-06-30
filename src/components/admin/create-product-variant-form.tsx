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
import { updateProductVariant } from "@/actions/update-product-variant";

interface Variant {
  id: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
  color: string;
  priceInCents: number;
  imageUrl: string;
}

interface CreateProductVariantFormProps {
  productId: string;
  variant?: Variant;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateProductVariantForm({
  productId,
  variant,
  trigger,
  onSuccess,
}: CreateProductVariantFormProps) {
  const isEditing = !!variant;
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProductVariantSchema>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      productId,
      name: variant?.name ?? "",
      slug: variant?.slug ?? "",
      size: variant?.size ?? "",
      color: variant?.color ?? "",
      priceInCents: variant?.priceInCents ?? 0,
      imageUrl: variant?.imageUrl ?? "",
    },
  });

  async function onSubmit(data: CreateProductVariantSchema) {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateProductVariant({ id: variant.id, ...data });
        toast.success("Variante atualizada com sucesso!");
      } else {
        await createProductVariant(data);
        toast.success("Variante criada com sucesso!");
        form.reset({ productId, name: "", slug: "", size: "", color: "", priceInCents: 0, imageUrl: "" });
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar variante"
            : "Erro ao criar variante";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Nova Variante
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="min-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Variante" : "Criar Variante"}</SheetTitle>
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
                {isLoading
                  ? isEditing
                    ? "Salvando..."
                    : "Criando..."
                  : isEditing
                    ? "Salvar Alterações"
                    : "Criar Variante"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
