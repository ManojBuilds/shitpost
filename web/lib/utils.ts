import { TweetStatus } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const seconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label}`;
  }

  return 'just now';
}


export const getStatusBadgeProps = (status: TweetStatus): {
  label: string, variant: "default" | "info" | "success" | "destructive" | "outline" | "secondary" | null | undefined
} => {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "default" };
    case "scheduled":
      return { label: "Scheduled", variant: "info" }; // custom variant
    case "published":
      return { label: "Published", variant: "success" }; // custom variant
    case "failed":
      return { label: "Failed", variant: "destructive" };
    default:
      return { label: status, variant: "outline" };
  }
};
