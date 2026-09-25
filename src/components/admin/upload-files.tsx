'use client';

import { useState } from 'react';
import { useUploadFiles } from '@better-upload/client';
import { UploadDropzone } from '../ui/upload-dropzone';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Check, ImagePlus, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadFilesProps {
    onSuccess?: (urls: string[]) => void;
    maxFiles?: number;
    trigger?: React.ReactNode;
    initialPreview?: string;
}

export function UploadFiles({
    onSuccess,
    maxFiles = 1,
    trigger,
    initialPreview,
}: UploadFilesProps) {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const { control } = useUploadFiles({
        route: 'images',
    });

    const handleOpenChange = (nextOpen: boolean) => {
        if (control.isPending) return;
        if (!nextOpen) {
            setFiles([]);
        }
        setOpen(nextOpen);
    };

    /**
     * Função executada EXCLUSIVAMENTE ao clicar no botão "Salvar".
     * Faz o upload para o Cloudflare R2 e repassa as URLs para o callback onSuccess.
     */
    async function handleSave() {
        if (files.length === 0) {
            toast.warning('Selecione pelo menos uma imagem para salvar.');
            return;
        }

        try {
            const result = await control.upload(files);

            if (result && result.files && result.files.length > 0) {
                const baseUrl = (
                    (result.metadata?.publicUrl as string) ||
                    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
                    ''
                ).replace(/\/$/, '');

                const uploadedUrls = result.files.map((item) =>
                    baseUrl ? `${baseUrl}/${item.objectInfo.key}` : item.objectInfo.key
                );

                toast.success(
                    uploadedUrls.length === 1
                        ? 'Imagem enviada e salva com sucesso!'
                        : `${uploadedUrls.length} imagens salvas com sucesso!`
                );

                onSuccess?.(uploadedUrls);
                setFiles([]);
                setOpen(false);
            } else if (result && result.failedFiles && result.failedFiles.length > 0) {
                toast.error('Não foi possível enviar a imagem. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no upload de imagem:', error);
            toast.error('Erro ao enviar a imagem para o servidor.');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        size="icon"
                        variant="secondary"
                        type="button"
                        title="Fazer upload de imagem"
                    >
                        <ImagePlus className="size-4" />
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent
                className="overflow-hidden p-0 gap-0"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className='px-5 pt-5'>
                    <DialogTitle>
                        Upload de Imagem
                    </DialogTitle>
                    <DialogDescription>
                        {files.length === 0
                            ? 'Selecione ou solte a imagem para pré-visualizar.'
                            : 'Confira a pré-visualização abaixo e clique em Salvar para concluir.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="w-full min-w-0 p-5 aspect-square flex flex-1">
                    <UploadDropzone
                        files={files}
                        onFilesChange={setFiles}
                        maxFiles={maxFiles}
                        disabled={control.isPending}
                        initialPreviewUrl={initialPreview}
                    />
                </div>

                <DialogFooter className="flex w-full bg-card border-t border-border p-5">
                    {/* <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={control.isPending}
                    >
                        Cancelar
                    </Button> */}

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={files.length === 0 || control.isPending}
                        className="w-full"
                    >
                        {control.isPending ? (
                            <>
                                Salvando...
                            </>
                        ) : (
                            <>
                                Salvar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}