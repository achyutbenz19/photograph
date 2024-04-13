import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";

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
      <body className={`${GeistSans.className} selection:bg-[#CEEAD6]`}>
        {children}
      </body>
      <Toaster />
    </html>
  );
}
