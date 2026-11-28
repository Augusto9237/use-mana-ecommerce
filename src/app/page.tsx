import { desc, eq } from "drizzle-orm";

import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, promotionTable } from "@/db/schema";
import CarouselWithProgress from "@/components/common/carousel";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

const Home = async () => {
  const products = await db.query.productTable.findMany({
    with: {
      variants: true,
    },
  });

  const promotions = await db.query.promotionTable.findMany({
    where: eq(promotionTable.isActive, true),
  });

  const newlyCreatedProducts = await db.query.productTable.findMany({
    orderBy: [desc(productTable.createdAt)],
    with: {
      variants: true,
    },
  });
  const categories = await db.query.categoryTable.findMany({});

  return (
    <>
      <Header />
      <div className="pt-24 pb-8 w-full flex flex-col justify-center">
        <CarouselWithProgress promotions={promotions} />
        <div className="max-w-screen-xl mx-auto flex flex-col w-full gap-5 lg:gap-8">
          <section className="grid grid-cols-3 max-sm:grid-cols-1 bg-card md:rounded-xl max-sm:gap-0 gap-6 justify-between">
            <div className="flex  items-center gap-4 p-5 justify-center w-full h-full flex-1 md:border-r  max-sm:border-b border-border">
              <ShieldCheck className="size-8 max-sm:size-6 text-primary" />
              <div className="flex flex-col">
                <h2 className="font-semibold max-sm:text-sm">Compra segura</h2>
                <p className="text-sm max-sm:text-xs text-muted-foreground">
                  Pagamento protegido
                </p>
              </div>
            </div>
            {/* <Separator orientation="vertical" className="h-10 max-sm:h-20" /> */}
            <div className="flex items-center gap-4 p-5 justify-center  w-full h-full flex-1 max-sm md:border-r  max-sm:border-b border-border">
              <RotateCcw className="size-8 max-sm:size-6 text-primary" />
              <div className="flex flex-col">
                <h2 className="font-semibold max-sm:text-sm">Troca fácil</h2>
                <p className="text-sm max-sm:text-xs text-muted-foreground">
                  Troca em até 7 dias
                </p>
              </div>
            </div>
            {/* <Separator orientation="vertical" className="h-10 max-sm:h-20" /> */}
            <div className="flex items-center gap-4 justify-center p-5 w-full h-full flex-1">
              <Truck className="size-8 max-sm:size-6 text-primary" />
              <div className="flex flex-col">
                <h2 className="font-semibold max-sm:text-sm">Envio rápido</h2>
                <p className="text-sm max-sm:text-xs text-muted-foreground">
                  Entrega em até 24h
                </p>
              </div>
            </div>
          </section>

          <ProductList products={products} title="Mais vendidos" />

          <section className="grid grid-cols-2 gap-5">
            <Link href="https://www.instagram.com/usemana_3/" target="_blank">
              <Image src="/insta.png" alt="insta" sizes="100vw" width={0} height={0} className="h-60 w-full rounded-md object-cover object-center" />
            </Link>

            <Link href="https://wa.me/5591993440434" target="_blank">
              <Image src="/wpp.png" alt="insta" sizes="100vw" width={0} height={0} className="h-60 w-full rounded-md object-cover object-center" />
            </Link>
          </section>

          <Link href="https://www.instagram.com/usemana_3/" target="_blank" className="px-5 md:hidden">
            <Image src="/insta.png" alt="insta" sizes="100vw" width={0} height={0} className="h-40 w-full rounded-md object-cover object-center" />
          </Link>

          <div className="w-full">
            <CategorySelector categories={categories} />
          </div>

          <ProductList products={newlyCreatedProducts} title="Novos produtos" />
          <Link href="https://www.google.com/maps/place/Loja+use+mana/@-1.7188619,-49.5317252,20z/data=!4m6!3m5!1s0x92a2c51014e3afdd:0xe766c9d8d994d7bc!8m2!3d-1.7188319!4d-49.5315802!16s%2Fg%2F11sn3g_fky?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" className="px-5 md:hidden">
            <Image src="/local.png" alt="address" sizes="100vw" width={0} height={0} className="h-40 w-full rounded-md object-cover object-center" />
          </Link>
        </div>
      </div >
      <Footer />
    </>
  );
};

export default Home;
