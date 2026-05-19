import Link from "next/link";

import { categoryTable } from "@/db/schema";

import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {categories.map((category) => (
        <div key={category.id} className="relative rounded-lg overflow-hidden h-[200px] md:min-h-[400px] md:h-full">
          <img
            src="https://dlkmodas.fbitsstatic.net/img/p/calca-legging-preta-com-cadarco-basica-dlk-77581/287332-1.jpg?w=1000&h=1428&v=no-value"
            alt={category.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 absolute inset-0"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex flex-col justify-end" >
            <div className="p-3">
              <h4 className="text-lg font-bold leading-tight">{category.name}</h4>
              <Link href={`/category/${category.slug}`} className="text-primary font-semibold text-sm items-center flex gap-1">
                Comprar <ChevronRight size={16}/>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySelector;
