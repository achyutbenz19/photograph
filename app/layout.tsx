import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { ModalProvider } from "@/hooks/modal-provider";

export const metadata: Metadata = {
  title: "photograph",
  description: "interact with your memories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} bg-[#FEEFC3] selection:text-black selection:bg-[#CEEAD6]`}
      >
        {children}
        <ModalProvider />
      </body>
      <Toaster />
    </html>
  );
}
