import { SparklesIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Tweet } from '@/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { ai } from '@/app/action';

export default function EnhanceTweet({ tweet }: { tweet: Tweet }) {
    const [isPending, startTransition] = useTransition()

    const updateTweet = useMutation(api.tweets.updateTweet);

    const handleEnhance = () => {
        startTransition(async () => {
            const promise = (async () => {
                const enhancedContent = await ai({ prompt: `Please enhance this tweet for virality for buildinpublic: ${tweet.content}` });
                if (enhancedContent) {
                    await updateTweet({
                        tweetId: tweet._id,
                        content: enhancedContent,
                        status: tweet.status
                    });
                } else {
                    throw new Error("Failed to enhance tweet");
                }
            })();

            toast.promise(promise, {
                loading: 'Enhancing tweet...',
                success: 'Tweet enhanced successfully!',
                error: 'Failed to enhance tweet.',
            });

            await promise;
        });
    };

    return (
        <div>
            <Button size="icon" variant="ghost" aria-label="Enhance tweet" onClick={handleEnhance} disabled={isPending}>
                <SparklesIcon className="w-4 h-4 text-blue-500" />
            </Button>
        </div>
    );
}
