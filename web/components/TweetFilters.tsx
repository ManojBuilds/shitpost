'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import {
    ListIcon,
    ClockIcon,
    SendIcon,
    FileClockIcon,
    FileWarningIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const filterConfig = {
    all: { icon: ListIcon, color: 'bg-gray-500' },
    scheduled: { icon: ClockIcon, color: 'bg-blue-500' },
    draft: { icon: FileClockIcon, color: 'bg-yellow-500' },
    published: { icon: SendIcon, color: 'bg-green-500' },
    failed: { icon: FileWarningIcon, color: 'bg-red-500' },
};

export default function TweetFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser();

    const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || 'all');
    const tweetCounts = useQuery(api.tweets.getTweetCounts, {
        username: user?.username || ''
    });

    function updateURL(status: string) {
        const current = new URLSearchParams(window.location.search);
        if (status !== 'all') {
            current.set('status', status);
        } else {
            current.delete('status');
        }
        router.push(`?${current.toString()}`);
    }

    function handleFilterClick(value: string) {
        setActiveFilter(value);
        updateURL(value);
    }

    useEffect(() => {
        setActiveFilter(searchParams.get('status') || 'all');
    }, [searchParams]);

    return (
        <div className="flex gap-2 p-4 overflow-x-auto">
            {Object.entries(filterConfig).map(([value, { icon: Icon, color }]) => (
                <button
                    key={value}
                    onClick={() => handleFilterClick(value)}
                    className={cn(
                        'flex items-center gap-2 p-2 rounded-lg transition-colors',
                        activeFilter === value ? `${color} text-white` : 'hover:bg-muted'
                    )}
                >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline capitalize">{value}</span>
                    <Badge variant={activeFilter === value ? 'default' : 'secondary'}>
                        {tweetCounts?.[value as keyof typeof tweetCounts] ?? 0}
                    </Badge>
                </button>
            ))}
        </div>
    );
}
