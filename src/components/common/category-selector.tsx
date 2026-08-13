import Link from "next/link";

import { categoryTable } from "@/db/schema";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  return (
    <>
    <h3 className="px-5 font-semibold mb-6">Categorias</h3>
    <div className="flex gap-4 w-full overflow-auto px-5 [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`} className="flex flex-col items-center">
          <div className="relative rounded-full overflow-hidden size-20 border border-border">
            <img
              src={category.imageUrl || "/placeholder-category.png"}
              alt={category.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 absolute inset-0"
            />
          </div>
          <h4 className="text-sm font-medium leading-tight mt-2">{category.name}</h4>
        </Link>
      ))}
    </div>
    </>
  );
};

export default CategorySelector;
