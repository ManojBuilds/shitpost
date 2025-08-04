import { Id } from "@/convex/_generated/dataModel";

export interface Tweet {
    _id: Id<"tweets">;
    _creationTime: number;
    content: string;
    status: string;
    username: string;
    tags: string[];
    scheduledAt: string;
}

export type TweetStatus = "draft" | "published" | 'scheduled' | 'failed'
