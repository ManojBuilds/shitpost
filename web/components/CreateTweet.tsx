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
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Tweet } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

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
  const createTweet = useMutation(api.tweets.createTweet);
  const updateTweet = useMutation(api.tweets.updateTweet);
  const [content, setContent] = useState(tweet?.content ?? "");
  const [status, setStatus] = useState(tweet?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    tweet?.scheduledAt ? new Date(tweet.scheduledAt) : undefined
  );

  const handleSubmit = async () => {
    if (!user) return;

    const promise = () => {
      if (tweet) {
        return updateTweet({
          tweetId: tweet._id,
          content,
          status,
          scheduledAt: scheduledAt?.toISOString(),
        });
      } else {
        return createTweet({
          username: user.username!,
          content,
          tags: [],
          scheduledAt: scheduledAt?.toISOString() ?? new Date().toISOString(),
          status: status,
        });
      }
    };

    toast.promise(promise, {
      loading: tweet ? "Updating tweet..." : "Creating tweet...",
      success: `Tweet ${tweet ? "updated" : "created"} successfully!`,
      error: `Failed to ${tweet ? "update" : "create"} tweet.`,
      finally: () => {
        setOpen(false);
      },
    });
  };

  const form = (
    <div className="grid gap-4 py-4">
      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2">
        <Select onValueChange={setStatus} defaultValue={status}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={scheduledAt}
              onSelect={setScheduledAt}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleSubmit}>
        {tweet ? "Update" : "Create"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="">
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom">
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
