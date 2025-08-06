'use client'
import { useTransition } from 'react';
import { ai } from '@/app/action';

export default function useAi() {
    const [isPending, startTransition] = useTransition()
    const handleEnhance = (prompt: string) => {
        let newTweet: string | null = null;
        startTransition(async () => {
            const enhancedContent = await ai({ prompt });
            newTweet = enhancedContent;
        });
        return newTweet;
    };
    return { isPending, handleEnhance }
}
