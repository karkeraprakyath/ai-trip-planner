



// /** @format */
"use client";

import { useRouter } from "next/navigation";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { ArrowDown, Globe2, Landmark, Plane, Send } from "lucide-react";
import React from "react";

export const suggestions = [
  {
    title: "Create New Trip",
    icon: <Globe2 className='text-blue-400 h-5 w-5 ' />,
  },
  {
    title: "Inspire me where to go ",
    icon: <Plane className='text-green-500 h-5 w-5' />,
  },
  {
    title: "Discover hidden gems",
    icon: <Landmark className='text-orange-500 h-5 w-5' />,
  },
  {
    title: "Adventure Destination",
    icon: <Globe2 className='text-yellow-600 h-5 w-5' />,
  },
];

function Hero() {
  const { user } = useUser();
  const router = useRouter();

  const onSend = () => {
    if (!user) {
      router.push("/sign-in");
    } else {
      router.push("/create-new-trip");
    }
  };

  return (
    <div className='mt-24 w-full flex justify-center'>
      <div className='max-w-3xl w-full text-center space-y-6'>
        <h1 className='text-xl md:text-5xl font-bold'>
          Hey I'm your personal{" "}
          <span className='text-primary'>Trip Planner</span>
        </h1>
        <p className='text-lg'>
          Tell me what you want, and I'll handle the rest: Flights, Hotels,
          Trip Planning — all in seconds.
        </p>
        <div>
          <div className='border rounded-2xl p-4 relative'>
            <Textarea
              placeholder='Create a Trip to Paris from New York'
              className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
            />
            <Button
              onClick={onSend}
              size={"icon"}
              className='absolute bottom-6 right-6'
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex gap-5'>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className='flex gap-2 items-center border rounded-full p-2 cursor-pointer hover:bg-primary hover:text-white'
            >
              {suggestion.icon}
              <h2 className='text-sm'>{suggestion.title}</h2>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-center flex-col'>
          <h2 className='my-7 mt-14 gap-2 flex text-center'>
            Not sure where to start <strong>See how it works</strong>{" "}
            <ArrowDown />
          </h2>
          <HeroVideoDialog
            className='block dark:hidden'
            animationStyle='from-center'
            videoSrc='https://www.example.com/dummy-video'
            thumbnailSrc='https://borneocreatives.com/wp-content/uploads/2024/09/1_MindtripProduct-1024x578.png'
            thumbnailAlt='Dummy Video Thumbnail'
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
