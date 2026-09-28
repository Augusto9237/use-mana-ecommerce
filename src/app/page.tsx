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
