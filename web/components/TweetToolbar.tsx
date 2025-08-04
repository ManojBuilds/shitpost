'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, SortAscIcon, SortDescIcon } from 'lucide-react';

export default function TweetToolbar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sortAsc, setSortAsc] = useState(searchParams.get('sort') !== 'desc');

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

    const debouncedSearchUpdate = useDebouncedCallback((val: string) => {
        updateURL({ search: val });
    }, 400);

    function handleSearchChange(value: string) {
        setSearch(value);
        debouncedSearchUpdate(value);
    }

    function toggleSort() {
        const newSort = sortAsc ? 'desc' : 'asc';
        setSortAsc(!sortAsc);
        updateURL({ sort: newSort });
    }

    return (
        <div className="flex justify-between items-center p-4 gap-4">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search tweets..."
                    className="pl-8"
                />
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={toggleSort}
                className="gap-1"
            >
                {sortAsc ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">{sortAsc ? 'Newest' : 'Oldest'}</span>
            </Button>
        </div>
    );
}
