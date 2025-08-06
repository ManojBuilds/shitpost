import { v } from 'convex/values';

export const EUploadMimeType = {
  Jpeg: "image/jpeg",
  Mp4: "video/mp4",
  Mov: "video/quicktime",
  Gif: "image/gif",
  Png: "image/png",
  Srt: "text/plain",
  Webp: "image/webp",
} as const;

export const mimeTypes = [
    EUploadMimeType.Jpeg,
    EUploadMimeType.Mp4,
    EUploadMimeType.Mov,
    EUploadMimeType.Png,
    EUploadMimeType.Gif,
    EUploadMimeType.Webp,
] as const;

export const MediaValidator = v.object({
    storageId:v.string() ,
    mimeType: v.union(...mimeTypes.map((t) => v.literal(t))),
});

export type Media = {
    storageId: string;
    mimeType: (typeof mimeTypes)[number];
};
