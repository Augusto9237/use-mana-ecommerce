"use client";

import * as React from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll"
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { lookupZipcode } from "@/lib/lookup-zipcode";

interface promotions {
  id: string;
  createdAt: Date;
  description: string;
  imageUrl: string;
  title: string;
  linkUrl: string;
  isActive: boolean;
}

interface CarouselWithProgressProps {
  promotions: promotions[]
}

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function CarouselWithProgress({ promotions }: CarouselWithProgressProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const progress = (current * 100) / count;

  console.log("baseUrl", baseUrl);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="w-full py-4">
      <Carousel className="w-full" setApi={setApi}
        plugins={[
          AutoScroll({
            speed: 0.4,
            startDelay: 0,
            stopOnInteraction: false
          })
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {promotions.map((p) => (
            <CarouselItem key={p.id}>
              <a href={p.linkUrl}>
                <Image
                  alt="carousel-item"
                  className="size-full object-cover object-center sm:max-h-[700px]"
                  src={p.imageUrl}
                  width={1920}
                  height={1080}
                  unoptimized
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Progress className="mt-5 mx-auto w-24 h-2" value={progress} />
    </div>
  );
}
