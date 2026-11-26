'use client'
import { ChevronLeft } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import React from "react";

interface ButtonProps {
    children?: React.ReactNode
}

export function ButtonBack({ children }: ButtonProps) {
    const router = useRouter()

    return (
        <Button variant="ghost" size={children ? "default" : "icon-sm"} onClick={() => router.back()}>
            {children || <ChevronLeft className="size-5" />}
        </Button>
    )
}