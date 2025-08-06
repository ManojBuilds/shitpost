'use client';

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ClockIcon } from "lucide-react";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(date ?? new Date());
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      if (newDate < new Date()) {
        setDate(new Date());
      } else {
        setDate(newDate);
      }
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    const newDate = new Date(date ?? new Date());
    if (type === "hour") {
      let newHour = parseInt(value);
      const currentAmPm = newDate.getHours() >= 12 ? "pm" : "am";
      if (currentAmPm === "pm" && newHour !== 12) {
        newHour += 12;
      }
      if (currentAmPm === "am" && newHour === 12) {
        newHour = 0;
      }
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHour = newDate.getHours();
      if (value === "pm" && currentHour < 12) {
        newDate.setHours(currentHour + 12);
      } else if (value === "am" && currentHour >= 12) {
        newDate.setHours(currentHour - 12);
      }
    }

    if (newDate < new Date()) {
      setDate(new Date());
    } else {
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex-1 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "MM/dd/yyyy hh:mm a")
          ) : (
            <span>MM/DD/YYYY hh:mm am/pm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            fromDate={new Date()}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => {
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={date && date.getHours() % 12 === hour % 12 ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {displayHour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <div className="flex flex-col p-2">
              <Button
                variant={date && date.getHours() < 12 ? "default" : "ghost"}
                onClick={() => handleTimeChange("ampm", "am")}
              >
                AM
              </Button>
              <Button
                variant={date && date.getHours() >= 12 ? "default" : "ghost"}
                onClick={() => handleTimeChange("ampm", "pm")}
              >
                PM
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
