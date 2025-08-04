'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ListIcon,
    ClockIcon,
    SendIcon,
    FileClockIcon,
    FileWarningIcon,
    PlusIcon,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import CreateTweet from './CreateTweet';

export default function Sidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser()

    const [, setSearch] = useState(searchParams.get('search') || '');
    const [, setSortAsc] = useState(searchParams.get('sort') !== 'desc');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || 'all');
    const tweetCounts = useQuery(api.tweets.getTweetCounts, {
        username: user?.username || ''
    })

    const filters = [
        { label: 'All Tweets', value: 'all', icon: ListIcon },
        { label: 'Scheduled', value: 'scheduled', icon: ClockIcon },
        { label: 'Drafts', value: 'draft', icon: FileClockIcon },
        { label: 'Published', value: 'published', icon: SendIcon },
        { label: 'Failed', value: 'failed', icon: FileWarningIcon },
    ];

    function updateURL(params: Record<string, string>) {
        const current = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                current.set(key, value);
            } else {
                current.delete(key);
            }
        });
        router.push(`?${current.toString()}`);
    }

    function handleFilterClick(value: string) {
        setActiveFilter(value);
        updateURL({ status: value !== 'all' ? value : '' });
    }

    useEffect(() => {
        // Sync with URL params
        const sp = new URLSearchParams(window.location.search);
        setSearch(sp.get('search') || '');
        setActiveFilter(sp.get('status') || 'all');
        setSortAsc(sp.get('sort') !== 'desc');
    }, []);

    return (
        <aside className="hidden md:flex w-[280px] h-[calc(100svh-6rem)] p-4 flex-col gap-6">
            <CreateTweet>
                <Button>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create Tweet
                </Button>
            </CreateTweet>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2">
                    {filters.map((f) => (
                        <Button
                            key={f.value}
                            variant={f.value === activeFilter ? 'default' : 'ghost'}
                            className="justify-between"
                            onClick={() => handleFilterClick(f.value)}
                        >
                            <div className="flex items-center gap-2">
                                <f.icon className="w-4 h-4" />
                                {f.label}
                            </div>
                            <Badge variant="secondary" className="ml-2">
                                {tweetCounts?.[f.value as keyof typeof tweetCounts] ?? 0}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    );
}
