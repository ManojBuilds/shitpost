'use client'
import Link from "next/link";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import CreateTweet from "./CreateTweet";
import { PlusIcon } from "lucide-react";
import { neobrutalism } from "@clerk/themes"

export default function Header() {
    return <div className="bg-[#f6f6f4]  border-b border-blue-200/50">
    <header className="max-w-5xl mx-auto w-full ">
        <div className="flex items-center justify-between p-2">
            <Link href={'/'} className="font-medium text-xl flex items-center gap-1">
                <Logo />
                <span>shitpost</span>
            </Link>
            <nav className="flex items-center gap-2">
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button variant={'ghost'}>Sign in</Button>
                    </SignInButton>
                    <SignUpButton mode="modal" forceRedirectUrl={'/auth/callback'}>
                        <Button>Create account</Button>
                    </SignUpButton>

                </SignedOut>
                <SignedIn>
                    <span className="sm:hidden">
                        <CreateTweet>
                            <Button>
                                <PlusIcon className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline-flex">
                                    Create Tweet
                                </span>
                            </Button>
                        </CreateTweet>
                    </span>
                    <UserButton appearance={{ theme: neobrutalism }} />
                </SignedIn>
            </nav>
        </div>
    </header>
</div>
}
