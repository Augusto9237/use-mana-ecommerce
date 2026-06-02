'use client'
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function InputSearch({ ...props }: React.ComponentPropsWithoutRef<"input">) {
    const [value, setValue] = useState("");
    const route = useRouter();

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        if (value.trim()) {
            route.push(`/search/${value}`);
        }
    }
    return (
        <form onSubmit={handleSearch} className="relative w-full max-sm:max-w-[60%] sm:max-w-sm">
            <Input
                type="text"
                placeholder="Buscar produtos"
                className="placeholder:max-sm:text-xs"
                {...props}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <Button type="submit" variant="ghost" className="absolute right-3 max-sm:right-1 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={16} />
            </Button>
        </form>
    );
}
