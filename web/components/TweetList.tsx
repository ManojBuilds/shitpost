'use client';

import { Tweet } from "@/types"
import TweetCard, { TweetCardSkeleton } from "./TweetCard"
import Image from "next/image"
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { toast } from "sonner";
import { buttonVariants } from "./ui/button";

export default function TweetList({ status, search, sort }: { status?: string, search?: string, sort?: string }) {
    const { user } = useUser();
    const { results, status: queryStatus, loadMore } = usePaginatedQuery(
        api.tweets.getTweets,
        user ? {
            username: user.username!,
            status,
            search,
            sort
        } : 'skip',
        { initialNumItems: 5 }
    );
    const { ref, inView } = useInView();
    console.log(results)

    useEffect(() => {
        if (inView && queryStatus === 'CanLoadMore') {
            loadMore(5);
        }
    }, [inView, queryStatus, loadMore]);

    if (queryStatus === 'LoadingFirstPage') {
        return <div className="space-y-6 p-4">
            <TweetCardSkeleton />
            <TweetCardSkeleton />
            <TweetCardSkeleton />
        </div>;
    }

    return <div className="space-y-6 p-4">
        {
            results.length === 0 ? <div className="grid place-items-center mt-4 sm:mt-12 h-44">
                <Image className="w-full h-44 object-contain" src={'/shitpost.png'} width={1024} height={1024} alt="shitpost" />
                <div className="text-center w-full text-muted-foreground mt-4">
                    <h3 className="text-center">To get started please run <br /> <pre className={buttonVariants({ variant: 'outline', className: "w-fit cursor-pointer mx-auto" })} onClick={() => {
                        navigator.clipboard.writeText('npx shitpost');
                        toast.info('Copied to cipboard')
                    }}><code>npm i -g @iamsidar07/shitpost</code></pre> <br/> in any one of your git repo with any changes</h3>
                </div>
            </div> : results.map((tweet, i) => (
                <div key={tweet._id} ref={i === results.length - 1 ? ref : undefined}>
                    <TweetCard tweet={tweet as Tweet} />
                </div>
            ))
        }
        {queryStatus === 'LoadingMore' && <TweetCardSkeleton />}
    </div>
}

