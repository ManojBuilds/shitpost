'use client';

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Gem,
  Clock,
  RefreshCcw,
  Terminal,
  Lightbulb,
  Sparkles,
  Send,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";
import { SignedIn, SignedOut, SignUpButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth()
  return (
    <div className="flex flex-col items-center min-h-screen py-16 w-full h-full">

      <div className="flex flex-col items-center px-4 sm:px-10 text-center w-full h-full ">
        {/* Hero Section */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          <span className="text-blue-600">Build in Public </span><br />Without the Burnout
        </h1>
        <p className="mt-4 text-lg sm:text-2xl text-muted-foreground max-w-2xl">
          Tweet consistently about what you&apos;re building without spending hours writing threads manually.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            variant={'outline'}
            onClick={async () => {
              await navigator.clipboard.writeText('npx shitpost');
              toast.info("Copied to clipboard");
            }}
          >
            <Terminal className="mr-2 h-4 w-4" />
            npx shitpost
          </Button>
          <SignedIn>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg", className: "flex items-center gap-2" }))}
            >
             Dashboard
             <ArrowRightIcon/>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl={'/auth/callback'}>
              <Button>Get Started</Button>
            </SignUpButton>
          </SignedOut>
        </div>

        <div className="max-w-5xl mx-auto mt-12 w-full h-full">
          <div
            className="relative flex items-center h-fit -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-gray-900/10 ring-inset lg:-m-4 lg:rounded-2xl lg:p-4 shadow-2xl"
          >
            <MuxPlayer
              streamType="on-demand"
              playbackId="lVD901dOj4Jeit58Vnx4jGSQUD5SkCEmue00NEFXT3o02A"
              metadata={{
                video_title: "Demo of I'm using shitpost",
              }}
              className="w-full h-full aspect-video"
            />
          </div>
        </div>

        {/* How It Works */}
        {/* <section className="mt-24 w-full max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: "Generate Tweet Ideas",
                icon: Lightbulb,
                step: 1,
              },
              {
                title: "Refine with AI",
                icon: Sparkles,
                step: 2,
              },
              {
                title: "Schedule or Post",
                icon: Send,
                step: 3,
              },
            ].map(({ title, icon: Icon, step }) => (
              <div
                key={step}
                className="flex flex-col items-start p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-green-500 font-bold text-lg">Step {step}</span>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base font-semibold">{title}</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* Features Section */}
        <section className="mt-24 w-full max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <Feature icon={Terminal} label="Developer-friendly CLI" />
            <Feature icon={Gem} label="Gemini-powered tweet enhancement" />
            <Feature icon={Clock} label="Smart tweet scheduling" />
            <Feature icon={RefreshCcw} label="Seamless X OAuth login" />
          </div>
        </section>

        {/* Testimonial */}
        <section className="mt-24 w-full max-w-xl text-center">
          <blockquote className="text-xl italic text-muted-foreground">
            &ldquo;Finally, tweeting about my work doesn’t feel like work.&rdquo;
          </blockquote>
          <p className="mt-2 text-lg font-semibold text-gray-800">— @devoy</p>
        </section>
      </div>
      <footer className="mt-24 w-full max-w-5xl text-center text-sm text-muted-foreground pt-8">
        <p className="mb-4 font-semibold text-gray-700">My Other Products</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://heysheet.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-primary transition-colors"
          >
            Heysheet: F*ck form builders take control in your hand
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Shitpost. All rights reserved.
        </p>
      </footer>
    </div>

  );
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-primary w-6 h-6" />
      <p className="text-lg">{label}</p>
    </div>
  );
}
