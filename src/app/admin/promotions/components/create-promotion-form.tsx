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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createPromotion } from "@/actions/create-promotion";
import {
  CreatePromotionSchema,
  createPromotionSchema,
} from "@/actions/create-promotion/schema";
import { updatePromotion } from "@/actions/update-promotion";
import { Plus } from "lucide-react";
import { UploadFiles } from "@/components/admin/upload-files";

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface CreatePromotionFormProps {
  promotion?: Promotion;
  trigger?: React.ReactNode;
}

export function CreatePromotionForm({
  promotion,
  trigger,
}: CreatePromotionFormProps) {
  const isEditing = !!promotion;
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePromotionSchema>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      title: promotion?.title ?? "",
      description: promotion?.description ?? "",
      imageUrl: promotion?.imageUrl ?? "",
      linkUrl: promotion?.linkUrl ?? "",
      isActive: promotion?.isActive ?? true,
    },
  });

  async function onSubmit(data: CreatePromotionSchema) {
    setIsLoading(true);
    try {
      if (isEditing) {
        await updatePromotion({ id: promotion.id, ...data });
        toast.success("Promoção atualizada com sucesso!");
      } else {
        await createPromotion(data);
        toast.success("Promoção criada com sucesso!");
        form.reset();
      }
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar promoção"
            : "Erro ao criar promoção";
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
            Nova promoção
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="min-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Promoção" : "Criar Promoção"}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Promoção de Verão"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a promoção em detalhes..."
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Mínimo de 10 caracteres</FormDescription>
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
                    URL pública da imagem da promoção
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Destino</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: /product-variant/mochila-preta ou https://exemplo.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Para onde o usuário será redirecionado (ex: /product-variant/mochila-preta ou URL completa)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Promoção ativa</FormLabel>
                    <FormDescription>
                      Promoções ativas ficam visíveis para os usuários
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
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
                    : "Criar Promoção"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
