import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarouselProductsProps{
  images: string[];
}

export default function CarouselProducts({ images }: CarouselProductsProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image}>
            <div>
              <img
                alt="dddepth-248"
                className="size-full object-cover"
                src={image}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious variant="ghost" />
      <CarouselNext  variant="ghost"/>
    </Carousel>
  );
}
