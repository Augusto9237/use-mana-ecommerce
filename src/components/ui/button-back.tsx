'use client'
import { ChevronLeft } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

export function ButtonBack() {
    const router = useRouter()

    return (
        <Button asChild variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ChevronLeft className="size-5"/>
        </Button>
    )
}