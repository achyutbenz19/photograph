import { BackgroundBeams } from "@/components/beams";
import FileUploader from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Component() {

  return (
    <>
      <section className="h-screen flex sm:mx-5 md:mx-10 lg:mx-20 2xl:mx-0 flex-col justify-center items-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-bold tracking-tighter text-6xl">
                  PhotoGraph
                </h1>
                <p className="max-w-[600px] text-neutral-600 md:text-xl">
                  interact with your memories
                </p>
              </div>
              <div className="flex flex-col gap-2 z-30 min-[400px]:flex-row">
                <Link href="/graph">
                  <Button size="lg">View your gallery</Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto aspect-video rounded-xl object-cover object-center w-full lg:order-last lg:aspect-square">
              <FileUploader />
            </div>
          </div>
        </div>
      </section>
      <BackgroundBeams />
    </>
  );
}
