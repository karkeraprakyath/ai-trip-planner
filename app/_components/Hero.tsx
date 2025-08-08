"use client";

/** @format */

import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, Globe2, Landmark, Plane, Send } from "lucide-react";
import React, { useCallback, useState } from "react";

const suggestions = [
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
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("");

  const submitPrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setPlan("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to generate plan");
      }
      const data = await res.json();
      setPlan(typeof data?.plan === "string" ? data.plan : JSON.stringify(data?.plan, null, 2));
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitPrompt();
    }
  };

  const applySuggestion = (text: string) => setPrompt(text);

  return (
    <div className='mt-24 w-full flex  justify-center'>
      <div className='max-w-3xl w-full text-center space-y-6'>
        <h1 className='text-xl md:text-5xl font-bold'>
          Hey I'm your personal{" "}
          <span className='text-primary'>Trip Planner</span>
        </h1>
        <p className='text-lg'>
          Tell me What you want, and I'll Handle the rest:Flights, Hotels, Trip
          Planning all in -seconds{" "}
        </p>
        <div>
          <div className='border rounded-2xl p-4 relative'>
            <Textarea
              placeholder='Create a Trip for Paris from New York in 5 days with a budget of $1500'
              className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size={'icon'} className='absolute bottom-6 right-6' onClick={submitPrompt} disabled={isLoading}>
              <Send className=' h-4 w-4' />
            </Button>
          </div>
          {isLoading && (
            <p className='text-sm text-muted-foreground mt-2'>Generating your trip plan…</p>
          )}
          {error && (
            <p className='text-sm text-red-500 mt-2'>{error}</p>
          )}
        </div>

        <div className='flex gap-5 flex-wrap justify-center'>
          {suggestions.map((s, index) => (
            <button
              type='button'
              key={index}
              onClick={() => applySuggestion(s.title)}
              className='flex gap-2 items-center border rounded-full px-3 py-2 cursor-pointer hover:bg-primary hover:text-white'>
              {s.icon}
              <span className='text-sm'>{s.title}</span>
            </button>
          ))}
        </div>

        {plan && (
          <div className='text-left mt-6 border rounded-xl p-4 bg-background shadow-sm'>
            <h3 className='font-semibold text-lg mb-2'>Your Trip Plan</h3>
            <div className='prose prose-sm max-w-none whitespace-pre-wrap break-words'>
              {plan}
            </div>
          </div>
        )}

        <div className=" flex items-center justify-center flex-col">
          <h2 className="my-7 mt-14 gap-2 flex text-center">Not sure where to start <strong>See how it works</strong>  <ArrowDown/> </h2>
          <HeroVideoDialog
            className="block dark:hidden"
            animationStyle="from-center"
            videoSrc="https://www.example.com/dummy-video"
            thumbnailSrc="https://borneocreatives.com/wp-content/uploads/2024/09/1_MindtripProduct-1024x578.png"
            thumbnailAlt="Dummy Video Thumbnail"
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
