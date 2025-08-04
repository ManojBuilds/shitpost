import Sidebar from "@/components/Sidebar";
import TweetFilters from "@/components/TweetFilters";
import TweetList from "@/components/TweetList";
import TweetToolbar from "@/components/TweetToolbar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string, search?: string, sort?: string }> }) {
    const { status, search, sort } = await searchParams;
    return (
        <div className="w-full h-full">
            <div className="max-w-5xl mx-auto">
                <div className="md:hidden">
                    <TweetFilters />
                    <TweetToolbar />
                </div>
                <section className="flex gap-6 divide-x">
                    <Sidebar />
                    <div className="flex-1 h-[calc(100svh-6rem)] pt-6 overflow-y-auto">
                        <div className="hidden md:block">
                            <TweetToolbar />
                        </div>
                        <TweetList status={status} search={search} sort={sort} />
                    </div>
                </section>
            </div>
        </div>
    )
}

