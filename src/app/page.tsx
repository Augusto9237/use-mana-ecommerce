import { desc, eq } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, promotionTable } from "@/db/schema";
import CarouselWithProgress from "@/components/common/carousel";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
      <div className="space-y-6 pt-16.5 pb-8 max-w-screen-xl mx-auto flex flex-col justify-center">
        <CarouselWithProgress promotions={promotions} />

        <section className="grid grid-cols-3 bg-card md:rounded-xl p-6 max-sm:p-5 max-sm:gap-5 gap-6 justify-between">
          <div className="flex max-sm:flex-col  items-center gap-4 max-sm:gap-2 max-sm:pr-5 justify-center w-full h-full flex-1 max-sm border-r border-border">
            <ShieldCheck className="size-10 max-sm:size-5 text-primary" />
            <div className="flex flex-col max-sm:text-center ">
              <h2 className="font-semibold max-sm:text-sm">Compra segura</h2>
              <p className="text-sm max-sm:text-xs text-muted-foreground">
                Pagamento protegido
              </p>
            </div>
          </div>
          {/* <Separator orientation="vertical" className="h-10 max-sm:h-20" /> */}
          <div className="flex max-sm:flex-col items-center gap-4 max-sm:gap-2 justify-center max-sm:justify-start w-full h-full flex-1 max-sm">
            <RotateCcw className="size-10 max-sm:size-5 text-primary" />
            <div className="flex flex-col max-sm:text-center">
              <h2 className="font-semibold max-sm:text-sm">Troca fácil</h2>
              <p className="text-sm max-sm:text-xs text-muted-foreground">
                Troca em até 7 dias
              </p>
            </div>
          </div>
          {/* <Separator orientation="vertical" className="h-10 max-sm:h-20" /> */}
          <div className="flex max-sm:flex-col items-center gap-4 max-sm:gap-2 max-sm:pl-5 justify-center max-sm:justify-start w-full h-full flex-1 max-sm border-l border-border">
            <Truck className="size-10 max-sm:size-5 text-primary" />
            <div className="flex flex-col max-sm:text-center">
              <h2 className="font-semibold max-sm:text-sm">Envio rápido</h2>
              <p className="text-sm max-sm:text-xs text-muted-foreground">
                Entrega em até 24h
              </p>
            </div>
          </div>
        </section>

        <ProductList products={products} title="Mais vendidos" />

        <div className="w-full">
          <CategorySelector categories={categories} />
        </div>

        <ProductList products={newlyCreatedProducts} title="Novos produtos" />

      </div>
      <Footer />
    </>
  );
};

export default Home;
