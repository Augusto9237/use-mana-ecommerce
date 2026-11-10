import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import CarouselProducts from "@/app/product-variant/[slug]/components/carousel-products";
import VariantSelector from "@/app/product-variant/[slug]/components/variant-selector";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { auth } from "@/lib/auth";

import PdvProductActions from "./components/pdv-product-actions";
import PdvCart from "../components/pdv-cart";

interface PdvProductVariantPageProps {
    params: Promise<{ slug: string }>;
}

const PdvProductVariantPage = async ({
    params,
}: PdvProductVariantPageProps) => {
    //   const session = await auth.api.getSession({
    //     headers: await headers(),
    //   });
    //   if (!session?.user) {
    //     redirect("/authentication");
    //   }
    //   if (session.user.role !== "admin") {
    //     redirect("/");
    //   }

    const { slug } = await params;
    const productVariant = await db.query.productVariantTable.findFirst({
        where: eq(productVariantTable.slug, slug),
        with: {
            product: {
                with: {
                    variants: true,
                },
            },
        },
    });
    if (!productVariant) {
        notFound();
    }

    const customers = await db.query.userTable.findMany({
        where: (user, { eq }) => eq(user.role, "user"),
        with: {
            shippingAddresses: {
                limit: 1,
                orderBy: (address, { desc }) => [desc(address.createdAt)],
            },
        },
        orderBy: (users, { asc }) => [asc(users.name)],
    });
    const customerOptions = customers.map((customer) => {
        const address = customer.shippingAddresses[0];
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: address?.phone ?? null,
            cpfOrCnpj: address?.cpfOrCnpj ?? null,
        };
    });

    return (
        <AdminLayout>
            <div className="flex w-full flex-col gap-6">
                <header className="flex items-center justify-between gap-6">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {productVariant.product.name} - {productVariant.name}
                    </h1>
                </header>
                {/* <Button asChild variant="outline" className="w-fit">
                    <Link href="/admin/pdv">Voltar ao PDV</Link>
                </Button> */}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="col-span-2 flex flex-col gap-6">
                        <CarouselProducts images={productVariant.imageUrl} />

                        <div className="flex flex-col gap-6">
                            <div className="px-5 lg:pt-5">
                                <VariantSelector
                                    selectedVariantSlug={productVariant.slug}
                                    variants={productVariant.product.variants}
                                    basePath="/admin/pdv"
                                />
                            </div>

                            <div className="px-5">
                                <h2 className="text-lg font-semibold">
                                    {productVariant.product.name}
                                </h2>
                                <h3 className="text-muted-foreground text-sm">
                                    {productVariant.name}
                                </h3>
                                {productVariant.discountPriceInCents ? (
                                    <p className="text-muted-foreground text-sm line-through">
                                        {formatCentsToBRL(productVariant.priceInCents)}
                                    </p>
                                ) : null}
                                <h3 className="text-lg font-semibold">
                                    {formatCentsToBRL(
                                        productVariant.discountPriceInCents ??
                                        productVariant.priceInCents,
                                    )}
                                </h3>
                            </div>

                            <PdvProductActions
                                key={productVariant.id}
                                productVariantId={productVariant.id}
                                sizes={productVariant.sizeInStock}
                                customers={customerOptions}
                            />

                            <div className="px-5">
                                <p className="max-sm:text-sm">
                                    {productVariant.product.description}
                                </p>
                            </div>
                        </div>
                    </div>
                    <PdvCart/>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PdvProductVariantPage;
