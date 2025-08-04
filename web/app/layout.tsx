import type { Metadata } from "next";
import { IBM_Plex_Sans, Geist, Rubik } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const font = Rubik({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Shitpost - Build in Public Without the Burnout",
  description: "Tweet consistently about what you're building without spending hours writing threads manually.",
  openGraph: {
    title: "Shitpost - Build in Public Without the Burnout",
    description: "Tweet consistently about what you're building without spending hours writing threads manually.",
    type: "website",
    url: "https://shitpost.heysheet.in", 
  },
  twitter: {
    card: "summary_large_image",
    title: "Shitpost - Build in Public Without the Burnout",
    description: "Tweet consistently about what you're building without spending hours writing threads manually.",
    creator: "@ManojBuilds",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased relative flex min-h-screen w-screen flex-none flex-col justify-between selection:text-[#201e13] selection:bg-[#eceadf]`}
      >
        <ClerkProvider
          appearance={{
            theme: neobrutalism
          }}
        >
          <ConvexClientProvider>
            <div className="relative flex min-h-screen w-screen flex-none flex-col justify-between">
              <Header />
              <main className="flex-1 border-blue-200/80 mx-3 grow md:mx-8 lg:mx-12 border-r border-l">
                {children}
              </main>
            </div>

          </ConvexClientProvider>
        </ClerkProvider>
        <Toaster />
        <div style={{
          backgroundImage: "url('/noise.png')"
        }} className="pointer-events-none [z-index:-1] absolute inset-0 bg-[size:180px] bg-repeat opacity-[0.035] dark:opacity-[0.015]"></div>
        <div className="h-full w-3 md:w-8 lg:w-12 bg-[#f6f6f5] dark:bg-[hsl(218,_13%,_5%,_0.2)] absolute top-0 z-[-1] left-0"></div>
        <div className="h-full w-3 md:w-8 lg:w-12 bg-[#f6f6f5] dark:bg-[hsl(218,_13%,_5%,_0.2)] absolute top-0 z-[-1] right-0"></div>
      </body>
    </html>
  );
}
