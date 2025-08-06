import { Id } from "@/convex/_generated/dataModel";

export type MimeTypes = "image/jpeg" | "video/mp4" | "video/quicktime" | "image/gif" | "image/png" | "image/webp";

export interface Tweet {
    _id: Id<"tweets">;
    _creationTime: number;
    content: string;
    status: string;
    username: string;
    tags: string[];
    scheduledAt: string;
    medias: { storageId: string; mimeType: MimeTypes }[];
    mediaUrls?: ({url: string, mimeType: MimeTypes} | null)[];
    community?: string;
}

export type TweetStatus = "draft" | "published" | 'scheduled' | 'failed'
