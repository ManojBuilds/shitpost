

"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCallbackUI from "@/components/AuthCallback";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const setupUser = async () => {
            try {
                const response = await fetch("/api/auth/callback");
                const data = await response.json();

                if (data.success) {
                    router.push("/dashboard");
                } else {
                    console.error("Setup failed:", data.message);
                    router.push("/");
                }
            } catch (error) {
                console.error("Error during setup:", error);
                router.push("/");
            }
        };

        setupUser();
    }, [router]);

    return <AuthCallbackUI />;
}
