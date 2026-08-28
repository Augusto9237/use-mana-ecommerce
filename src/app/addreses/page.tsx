import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import AddressCard from "@/app/addreses/components/address-card";

export default async function MyAddressPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        redirect("/authentication");
    }

    const addresses = await db.query.shippingAddressTable.findMany({
        where: eq(shippingAddressTable.userId, session.user.id),
        orderBy: (shippingAddress, { asc }) => [asc(shippingAddress.createdAt)],
    });

    return (
        <>
            <Header />
            <div className="px-5 max-w-screen-xl mx-auto pt-20 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Meus Endereços</h2>
                </div>

                {addresses.length > 0 ? (
                    <div className="flex flex-col gap-4 w-full">
                        {addresses.map((addr) => (
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