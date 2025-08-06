'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { MimeTypes, Tweet } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { useAction, useMutation } from "convex/react";
import { FileImage, Globe, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { DateTimePicker } from "./DateTimePicker";
import { ai } from "@/app/action";
import { Badge } from "./ui/badge";
import Image from "next/image";
import useAi from "@/hooks/useAi";
import { Skeleton } from "./ui/skeleton";

const MAX_TWEET_LENGTH = 280;
const COMMUNITIES = [
  { id: 'everyone', name: 'Everyone' },
  {
    id: "1495042358068477955",
    name: "Buildinpublic"
  }
]

export default function CreateTweet({
  children,
  tweet,
}: {
  children: React.ReactNode;
  tweet?: Tweet;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const createTweet = useMutation(api.tweets.createTweet);
  const updateTweet = useMutation(api.tweets.updateTweet);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const sendMedia = useAction(api.files.sendMedia);
  const ai = useAi()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(tweet?.content ?? "");
  const [status, setStatus] = useState(tweet?.status ?? "draft");
  const [community, setCommunity] = useState(tweet?.community ?? 'everyone');
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    tweet?.scheduledAt ? new Date(tweet.scheduledAt) : undefined
  );
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string, mimeType: MimeTypes }[]>(tweet?.mediaUrls?.filter((media) => media !== null) as { url: string, mimeType: MimeTypes }[] || []);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_TWEET_LENGTH;
  const progress = (characterCount / MAX_TWEET_LENGTH) * 100;

  useEffect(() => {
    if (scheduledAt) {
      setStatus("scheduled");
    }
  }, [scheduledAt]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMedia([...media, ...files]);
      const newPreviews = files.map((file) => ({
        url: URL.createObjectURL(file),
        mimeType: file.type as MimeTypes,
      }));
      setMediaPreviews([...mediaPreviews, ...newPreviews]);
    }
  };

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleRemoveMedia = (previewToRemove: { url: string, mimeType: MimeTypes }) => {
    const indexToRemove = mediaPreviews.findIndex(
      (preview) => preview.url === previewToRemove.url
    );
    if (indexToRemove !== -1) {
      setMedia(media.filter((_, i) => i !== indexToRemove));
      setMediaPreviews(mediaPreviews.filter((_, i) => i !== indexToRemove));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    startTransition(async () => {
      try {

        let tweetId;
        if (tweet) {
          await updateTweet({
            tweetId: tweet._id,
            content,
            status,
            scheduledAt: scheduledAt?.toISOString(),
            community: community
          });
          tweetId = tweet._id;
        } else {
          tweetId = await createTweet({
            username: user.username!,
            content,
            tags: [],
            scheduledAt: scheduledAt?.toISOString() ?? new Date().toISOString(),
            status: status,
            medias: [],
            community: community
          });
        }

        if (media.length > 0) {
          const uploadUrl = await generateUploadUrl();
          const files = await Promise.all(
            media.map(async (file) => {
              const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
              });
              const { storageId } = await response.json();
              return { storageId, mimeType: file.type };
            })
          );
          await sendMedia({ files, tweetId });
          setContent('')
          setMediaPreviews([])
          setScheduledAt(undefined)
        }
      } catch (error: any) {
        console.error(error)
        toast.error(error?.message)
      } finally {
        setOpen(false)
      }
    });
  };

  const handleEnhance = async () => {
    const enhancedContent = await ai.handleEnhance(`Please fix any grammer errors and spelling mistake of this tweet and improve just return a single tweet nothing else do not add text like fixed:. here is the draft tweet: ${content}`)
    if (enhancedContent) {
      setContent(enhancedContent);
    }
  };

  const form = (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Select onValueChange={setCommunity} defaultValue={community}>
            <SelectTrigger className="w-fit text-blue-500 font-semibold border-none">
              <Globe className="h-4 w-4 mr-1 text-blue-500" />
              <SelectValue placeholder="Everyone" className="placeholder:!text-blue-500" />
            </SelectTrigger>
            <SelectContent>
              {
                COMMUNITIES.map(({ id, name }, i) => (
                  <SelectItem key={i} value={id}>{name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        {
          tweet?._id ?
            <Select onValueChange={setStatus} defaultValue={status}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            : <Badge>Draft</Badge>
        }
      </div>
      {
        ai.isPending ?
          <div style={{ height: textareaRef.current?.style.height }} className="space-y-1">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-6" />
          </div>
          :
          <Textarea
            ref={textareaRef}
            placeholder="What's happening?"
            value={content}
            onChange={handleContentChange}
            className="border-none focus:ring-0 text-xl w-full outline-none focus-visible:ring-0 shadow-none resize-none min-h-16"
            maxLength={MAX_TWEET_LENGTH + 20}
            autoFocus
            rows={1}
          />

      }
      {mediaPreviews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaPreviews.map((preview) => (
            <div key={preview.url} className="relative w-full h-40">
              {preview.mimeType.startsWith("image/") ? (
                <img key={preview.url} width={200} height={200} src={preview.url} alt="media preview" className="rounded-lg object-cover w-full h-full" />
              ) : (
                <video key={preview.url} src={preview.url} controls className="rounded-lg object-cover w-full h-full" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full h-6 w-6"
                onClick={() => handleRemoveMedia(preview)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 text-blue-500">
          <Button variant={'outline'} onClick={() => mediaInputRef.current?.click()}>
            <FileImage />
          </Button>
          <input
            type="file"
            ref={mediaInputRef}
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <DateTimePicker date={scheduledAt} setDate={setScheduledAt} />
          <Button variant="outline" size="icon" onClick={handleEnhance}>
            <Sparkles />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative h-8 w-8">
            <motion.svg
              className="absolute top-0 left-0"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                strokeWidth="3"
                className="stroke-gray-200 dark:stroke-gray-700"
                fill="transparent"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                strokeWidth="3"
                className={`stroke-current ${isOverLimit ? "text-red-500" : "text-blue-500"}`}
                fill="transparent"
                strokeDasharray="87.96"
                strokeDashoffset={87.96 - (progress / 100) * 87.96}
                transform="rotate(-90 16 16)"
              />
            </motion.svg>
          </div>
          <Button onClick={handleSubmit} disabled={isOverLimit || !content || isPending} className="flex-1">
            {
              isPending && <Loader2 className="w-5 h-5 animate-spin" />
            }
            {tweet ? "Update" : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{tweet ? "Edit" : "Create"} Tweet</DialogTitle>
            <DialogDescription>
              {tweet
                ? "Edit your tweet content below."
                : "Write your new tweet content below."}
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl shadow-2xl">
        <SheetHeader>
          <SheetTitle>{tweet ? "Edit" : "Create"} Tweet</SheetTitle>
          <SheetDescription>
            {tweet
              ? "Edit your tweet content below."
              : "Write your new tweet content below."}
          </SheetDescription>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
}
