import { desc, eq } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, promotionTable } from "@/db/schema";
import CarouselWithProgress from "@/components/common/carousel";

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

        <ProductList products={products} title="Mais vendidos" />

        <div className="px-5 w-full">
          <CategorySelector categories={categories} />
        </div>

        <ProductList products={newlyCreatedProducts} title="Novos produtos" />

      </div>
      <Footer />
    </>
  );
};

export default Home;
