import { Header } from "@/components/common/header";
import { getUserAddresses } from "@/actions/get-user-addresses";
import AddressCard from "@/app/addreses/components/address-card";
import type { InferModel } from "drizzle-orm";
import { shippingAddressTable } from "@/db/schema";

type ShippingAddress = InferModel<typeof shippingAddressTable>;

export default async function MyAddressPage() {
    let addresses: ShippingAddress[] = [];

    try {
        addresses = await getUserAddresses();
    } catch (err) {
        console.error("Erro carregando endereços:", err);
    }

    return (
        <>
            <Header />
            <div className="px-5 max-w-screen-xl mx-auto pt-20 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Meus Endereços</h2>
                </div>

                {Array.isArray(addresses) && addresses.length > 0 ? (
                    <div className="flex flex-col gap-4 w-full">
                        {addresses.map((addr: ShippingAddress) => (
                            <AddressCard key={addr.id} address={addr} />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-600">Nenhum endereço cadastrado.</div>
                )}
            </div>
        </>
    );
}