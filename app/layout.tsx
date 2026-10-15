import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Apodex Labs",
  description: "From apódeixis: demonstrating what works.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <TopNav />
        <div className="bg-secondary border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="eyebrow mb-5">Hypothesis Testing</p>
            <h1 className="font-lora text-[52px] font-bold tracking-tight text-foreground leading-tight">
              Apodex Labs.
            </h1>
            <p className="mt-5 font-lora text-[18px] italic text-muted-foreground border-l-[3px] border-[#1D9E75] pl-4">
              From apódeixis: demonstrating what works.
            </p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
