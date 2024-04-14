"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import Image from "next/image";
import {
  Carousel,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "./ui/carousel";

export function PhotoModal() {
  const { isOpen, onClose, data } = useModal();

  if (!isOpen || !data || data.length === undefined) return null;

  function consolidateData(items: any): any {
    const dataMap = new Map<
      string,
      { connections: string[]; description: string; data: string }
    >();

    items &&
      data &&
      items.forEach(
        (item: { data: string; connection: string; description: string }) => {
          const existingEntry = dataMap.get(item.data);
          if (existingEntry) {
            existingEntry.connections.push(item.connection);
            existingEntry.description += " " + item.description;
          } else {
            dataMap.set(item.data, {
              connections: [item.connection],
              description: item.description,
              data: item.data.replace(/^\.\.\/public\//, ""),
            });
          }
        },
      );

    const result = Array.from(dataMap.values()).map((entry) => ({
      data: entry.data,
      connection: entry.connections.join(", "),
      description: entry.description,
    }));
    return result;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full text-white">
        <Carousel className="flex items-center justify-center dark:bg-neutral-900 w-full dark:text-white text-black my-2 rounded-lg p-4 leading-relaxed drop-shadow-sm mr-auto lg:max-w-full">
          <CarouselPrevious className="ml-20 xl:ml-24" />
          <CarouselContent>
            {data &&
              consolidateData(data).map((value: any, index: number) => (
                <CarouselItem
                  className="flex flex-col text-center w-[50%] mx-auto items-center justify-center text-white"
                  key={index}
                >
                  <h3 className="text-3xl w-[70%]">{value.connection}</h3>
                  {value.data.endsWith(".mp4") ? (
                    <iframe
                      className="rounded-2xl object-contain"
                      src={`/${value.data}`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      height="500"
                      width="600"
                    ></iframe>
                  ) : (
                    <Image
                      className="rounded-2xl my-8 object-contain"
                      src={`/${value.data}`}
                      alt={`${value.data}`}
                      height={250}
                      width={250}
                    />
                  )}
                  <h3 className="text-xl pt-4 w-[70%]">{value.description}</h3>
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselNext className="xl:mr-24 mr-20" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
