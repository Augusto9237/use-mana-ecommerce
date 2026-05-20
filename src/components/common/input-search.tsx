import { Search } from "lucide-react";
import { Input } from "../ui/input";

export function InputSearch({ ...props }: React.ComponentPropsWithoutRef<"input">) {
    return (
        <div className="relative w-full max-sm:max-w-[60%] sm:max-w-sm">
            <Input
                type="text"
                placeholder="O que você está procurando?"
                className="placeholder:max-sm:text-xs"
                {...props}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        </div>
    );
}
