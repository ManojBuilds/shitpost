'use client';

import { Tweet } from "@/types"
import TweetCard, { TweetCardSkeleton } from "./TweetCard"
import Image from "next/image"
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

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
            results.length === 0 ? <div className="grid place-items-center mt-12 h-44">
                <Image className="w-full h-44 object-contain" src={'/no-tweet.png'} width={1024} height={1536} alt="shitpost" />
            </div> : results.map((tweet, i) => (
                <div key={tweet._id} ref={i === results.length - 1 ? ref : undefined}>
                    <TweetCard tweet={tweet as Tweet} />
                </div>
            ))
        }
        {queryStatus === 'LoadingMore' && <TweetCardSkeleton />}
    </div>
}

