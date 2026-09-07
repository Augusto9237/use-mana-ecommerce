"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
import { createCategory } from "@/actions/create-category";
import {
  CreateCategorySchema,
  createCategorySchema,
} from "@/actions/create-category/schema";
import { updateCategory } from "@/actions/update-category";
import { Plus } from "lucide-react";
import { UploadFiles } from "./upload-files";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CreateCategoryFormProps {
  category?: Category;
  trigger?: React.ReactNode;
}

export function CreateCategoryForm({
  category,
  trigger,
}: CreateCategoryFormProps) {
  const isEditing = !!category;
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      imageUrl: category?.imageUrl ?? "",
    },
  });

  async function onSubmit(data: CreateCategorySchema) {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateCategory({ id: category.id, ...data });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createCategory(data);
        toast.success("Categoria criada com sucesso!");
        form.reset();
      }
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar categoria"
            : "Erro ao criar categoria";
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
            Nova categoria
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="min-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Categoria" : "Criar Categoria"}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Roupas Masculinas"
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
                      placeholder="roupas-masculinas"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL amigável para a categoria (use hífens)
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
                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        placeholder="https://example.com/image-1.jpg"
                        disabled={isLoading}
                        {...field}
                        value={field.value != null && !Number.isNaN(field.value) ? String(field.value) : ""}
                      />
                      <UploadFiles
                        maxFiles={1}
                        initialPreview={field.value || undefined}
                        onSuccess={(urls) => {
                          if (urls && urls[0]) {
                            field.onChange(urls[0]);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    URL da imagem de capa para a categoria
                  </FormDescription>
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
                    : "Criar Categoria"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
