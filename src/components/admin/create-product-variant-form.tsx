"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import { updateProductVariant } from "@/actions/update-product-variant";

interface Variant {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sizeInStock: Array<{ size: string; stock: number }>;
  color: string;
  costInCents: number;
  priceInCents: number;
  imageUrl: string[];
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
      sizeInStock: variant?.sizeInStock ?? [{ size: "", stock: 0 }],
      color: variant?.color ?? "",
      costInCents: variant?.costInCents ?? 0,
      priceInCents: variant?.priceInCents ?? 0,
      imageUrl: variant?.imageUrl ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizeInStock",
  });

  async function onSubmit(data: CreateProductVariantSchema) {
    setIsLoading(true);
    try {
      // Filtrar URLs vazias
      const filteredData = {
        ...data,
        imageUrl: data.imageUrl.filter((url) => url && url.trim() !== ""),
      };

      if (isEditing) {
        await updateProductVariant({ id: variant.id, ...filteredData });
        toast.success("Variante atualizada com sucesso!");
      } else {
        await createProductVariant(filteredData);
        toast.success("Variante criada com sucesso!");
        form.reset({ productId, name: "", slug: "", sizeInStock: [{ size: "", stock: 0 }], color: "", priceInCents: 0, imageUrl: [] });
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

            <div>
              <div className="flex items-center justify-between">
                <FormLabel>Tamanhos e Estoque</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => append({ size: "", stock: 0 })}
                  disabled={isLoading}
                  className="mb-1"
                >
                  <Plus />
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 mb-2">
                  <FormField
                    control={form.control}
                    name={`sizeInStock.${index}.size`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Ex: M"
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
                    name={`sizeInStock.${index}.stock`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Estoque"
                            disabled={isLoading}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <FormMessage>{form.formState.errors.sizeInStock?.message}</FormMessage>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="costInCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (em centavos)</FormLabel>
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
            </div>

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

            <div className="space-y-3">
              <FormLabel>URLs das Imagens</FormLabel>
              <FormDescription>
                Adicione até 4 URLs de imagens (deixe em branco se não usar)
              </FormDescription>
              {[0, 1, 2, 3].map((index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`imageUrl.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder={`https://example.com/image-${index + 1}.jpg`}
                          disabled={isLoading}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

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
