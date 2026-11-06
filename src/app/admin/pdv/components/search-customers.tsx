"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Pencil, Search, UserRoundPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreateUserForm } from "@/components/admin/create-user-form";

export interface PdvCustomer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cpfOrCnpj: string | null;
}

interface SearchCustomersProps {
    customers: PdvCustomer[];
    selectedCustomer: PdvCustomer | null;
    onSelectCustomer: (customer: PdvCustomer) => void;
}

const INITIAL_CUSTOMER_LIMIT = 4;

const normalize = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const SearchCustomers = ({
    customers,
    selectedCustomer,
    onSelectCustomer,
}: SearchCustomersProps) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [draftCustomerId, setDraftCustomerId] = useState("");

    const filteredCustomers = useMemo(() => {
        const query = normalize(searchQuery.trim());

        if (!query) return customers;

        const terms = query.split(/\s+/).filter(Boolean);
        const digits = query.replace(/\D/g, "");

        return customers.filter((customer) => {
            const fields = [
                customer.name,
                customer.email,
                customer.phone ?? "",
                customer.cpfOrCnpj ?? "",
            ].map(normalize);
            const matchesText = terms.every((term) =>
                fields.some((field) => field.includes(term)),
            );
            const matchesDigits =
                digits.length > 0 &&
                [customer.phone ?? "", customer.cpfOrCnpj ?? ""].some((value) =>
                    value.replace(/\D/g, "").includes(digits),
                );

            return matchesText || matchesDigits;
        });
    }, [customers, searchQuery]);

    const visibleCustomers =
        showAll || searchQuery.trim()
            ? filteredCustomers
            : filteredCustomers.slice(0, INITIAL_CUSTOMER_LIMIT);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
            setDraftCustomerId(selectedCustomer?.id ?? customers[0]?.id ?? "");
            setSearchQuery("");
            setShowAll(false);
        }
    };

    const handleSelect = (customerId: string) => {
        const customer = customers.find((item) => item.id === customerId);
        if (!customer) return;

        onSelectCustomer(customer);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full max-w-sm" variant={selectedCustomer ? "secondary" : "default"}>
                    {selectedCustomer ?
                        <>
                            <Pencil />
                            Alterar cliente
                        </> :
                        <>
                            <Search />
                            Selecionar cliente
                        </>
                    }
                </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-card gap-5 p-5 sm:max-w-2xl sm:p-6">
                <DialogHeader className="gap-1">
                    <DialogTitle>Buscar Cliente</DialogTitle>
                    <DialogDescription>
                        Busque e selecione o cliente para esta venda.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative flex -items-center gap-4">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        autoFocus
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Digite o nome, CPF ou telefone..."
                        aria-label="Buscar cliente por nome, CPF, telefone ou e-mail"
                        className="pr-10 pl-10"
                    />
                    <CreateUserForm>
                        <Button size="icon">
                            <UserRoundPlus />
                        </Button>
                    </CreateUserForm>
                </div>

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Clientes encontrados</h3>
                    {!searchQuery.trim() &&
                        filteredCustomers.length > INITIAL_CUSTOMER_LIMIT && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-primary h-auto gap-1 px-1"
                                onClick={() => setShowAll((previous) => !previous)}
                            >
                                {showAll ? "Mostrar menos" : "Ver todos"}
                                <ArrowRight className="size-4" />
                            </Button>
                        )}
                </div>

                <RadioGroup
                    value={draftCustomerId}
                    onValueChange={setDraftCustomerId}
                    aria-label="Selecione um cliente"
                    className="max-h-[min(50dvh,24rem)] gap-2 overflow-y-auto pr-1"
                >
                    {visibleCustomers.map((customer) => {
                        const initials = customer.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase();
                        const contact = [
                            customer.cpfOrCnpj ? `CPF: ${customer.cpfOrCnpj}` : null,
                            customer.phone,
                        ]
                            .filter(Boolean)
                            .join("  ·  ");
                        const isSelected = draftCustomerId === customer.id;

                        return (
                            <div
                                key={customer.id}
                                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background/40 hover:border-muted-foreground/40"
                                    }`}
                            >
                                <RadioGroupItem
                                    id={`customer-${customer.id}`}
                                    value={customer.id}
                                    aria-label={`Selecionar ${customer.name}`}
                                />
                                <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                                    {initials || "CL"}
                                </div>
                                <label
                                    htmlFor={`customer-${customer.id}`}
                                    className="min-w-0 flex-1 cursor-pointer"
                                >
                                    <span className="block truncate text-sm font-semibold">
                                        {customer.name}
                                    </span>
                                    <span className="text-muted-foreground block truncate text-xs">
                                        {contact || customer.email}
                                    </span>
                                </label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => handleSelect(customer.id)}
                                >
                                    Selecionar
                                </Button>
                            </div>
                        );
                    })}
                </RadioGroup>

                {filteredCustomers.length === 0 && (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        Nenhum cliente encontrado para essa busca.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SearchCustomers;
