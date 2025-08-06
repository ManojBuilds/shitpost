import { getStatusBadgeProps, timeAgo } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ClockIcon, PenIcon, SendIcon, SparklesIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Tweet, TweetStatus } from '@/types';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { getAccessToken, tweetPost } from '@/app/action';
import CreateTweet from './CreateTweet';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import EnhanceTweet from './EnhanceTweet';
import useAi from '@/hooks/useAi';


export default function TweetCard({ tweet }: { tweet: Tweet }) {
  const { user } = useUser();
  const { label, variant } = getStatusBadgeProps(tweet.status as TweetStatus);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    tweet?.scheduledAt ? new Date(tweet.scheduledAt) : undefined
  );

  const deleteTweet = useMutation(api.tweets.deleteTweet);
  const scheduleTweet = useMutation(api.tweets.scheduleTweet);
  const postTweet = useAction(api.twitter.postTweet)
  const updateTweet = useMutation(api.tweets.updateTweet);
  const ai = useAi()

  const handleTweetPost = async () => {
    setIsPosting(true);
    try {
      const token = await getAccessToken()
      await postTweet({ content: tweet.content, id: tweet._id, accessToken: token!, medias: tweet.medias, community: tweet.community });
      toast.success('Tweet has been published');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTweet({ tweetId: tweet._id });
      toast.success('Tweet deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt || scheduledAt < new Date()) {
      toast.error('Invalid scheduled time');
      return;
    }
    setIsScheduling(true);
    try {
      await scheduleTweet({
        tweetId: tweet._id,
        scheduledAt: scheduledAt.toISOString(),
      });
      toast.success('Tweet scheduled');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to schedule');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const newDate = scheduledAt ? new Date(scheduledAt) : new Date();
    if (type === 'hour') newDate.setHours(parseInt(value));
    else newDate.setMinutes(parseInt(value));
    setScheduledAt(newDate);
  };

  const handleEnhance = async () => {
    const enhancedContent = await ai.handleEnhance(`Please enhance this tweet for virality for buildinpublic: ${tweet.content}`);
    if (enhancedContent) {
      await updateTweet({
        tweetId: tweet._id,
        content: enhancedContent,
        status: tweet.status
      });
    } else {
      throw new Error("Failed to enhance tweet");
    }
  }
  return (
    <Card className="hover:shadow-xl transition-shadow duration-200 group">
      <CardHeader className="flex gap-3 items-start relative pb-0">
        <CardTitle className="sr-only">Tweet</CardTitle>
        <Image
          src={user?.imageUrl ?? "/default-profile.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="flex flex-col">
          <h2 className="truncate max-w-xs text-sm font-semibold">{user?.fullName}</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>@{tweet.username}</span>
            <span>·</span>
            <span>{timeAgo(new Date(tweet._creationTime))}</span>
          </div>
        </div>
        <Badge variant={variant} className="absolute top-2 right-3 capitalize z-10">
          {label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-1 pb-2 text-sm leading-relaxed whitespace-pre-wrap">
        {ai.isPending ? <div className='space-y-1'>
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-1/2 h-6" />
        </div> : tweet.content}
        {tweet.mediaUrls && tweet.mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {tweet.mediaUrls.map((media, index) => (
              media?.url && (
                <div key={index} className='h-44 aspect-video'>
                  {media.mimeType.startsWith("image/") ? (
                    <img src={media.url} alt="tweet media" width={200} height={200} className="rounded-lg object-cover w-full h-full" />
                  ) : (
                    <video src={media.url} controls className="rounded-lg object-cover w-full h-full" />
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-2">
          {/* Post now */}
          <Button size="sm" onClick={handleTweetPost} disabled={isPosting}>
            {isPosting ? 'Posting...' : (
              <>
                <SendIcon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Post now</span>
              </>
            )}
          </Button>

          {/* Schedule */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="sm">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">
                  {tweet.status === 'scheduled' && scheduledAt
                    ? format(scheduledAt, 'MMM d, h:mm a')
                    : 'Schedule'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px]">
              <Calendar
                mode="single"
                selected={scheduledAt}
                onSelect={setScheduledAt}
              />
              <div className="flex gap-2 mt-2">
                <Select onValueChange={(v) => handleTimeChange('hour', v)} defaultValue={scheduledAt?.getHours().toString()}>
                  <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => handleTimeChange('minute', v)} defaultValue={scheduledAt?.getMinutes().toString()}>
                  <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSchedule}
                disabled={isScheduling}
                className="w-full mt-3"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Tweet'}
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right actions */}
        <div className="flex gap-2">
          <CreateTweet tweet={tweet}>
            <Button size="icon" variant="ghost" aria-label="Edit">
              <PenIcon className="w-4 h-4" />
            </Button>
          </CreateTweet>
          <Button size="icon" variant="ghost" aria-label="Enhance tweet" onClick={handleEnhance} disabled={ai.isPending}>
            <SparklesIcon className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete tweet"
          >
            {isDeleting ? '...' : <TrashIcon className="w-4 h-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function TweetCardSkeleton() {
  return (
    <Card className="">
      {/* Header */}
      <CardHeader className="flex gap-3 items-start relative pb-0">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-3" />
        </div>
        <Skeleton className="absolute top-2 right-3 w-20 h-6" />
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-1 pb-2 text-sm leading-relaxed whitespace-pre-wrap">
        <Skeleton className="w-full h-16" />
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>

        {/* Right actions */}
        <div className="flex gap-2">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-10 h-10" />
        </div>
      </CardFooter>
    </Card>
  );
}
