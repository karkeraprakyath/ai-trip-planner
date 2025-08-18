"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { getUnsplashImage } from "@/lib/unsplash";
import { googleMapsUrlFromQuery } from "@/lib/utils";

interface Activity {
  place_name: string;
  place_details?: string;
  place_address?: string;
  place_image_url?: string | null;
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  const initialImage = useMemo(() => {
    const candidate = activity?.place_image_url ?? null;
    if (!candidate) return null;
    try {
      const url = new URL(candidate);
      // Ignore known placeholder or unknown domains; we'll fetch Unsplash instead
      if (url.hostname === "example.com") return null;
      return candidate;
    } catch {
      return null;
    }
  }, [activity?.place_image_url]);

  const [img, setImg] = useState<string | null>(initialImage);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!initialImage && activity?.place_name) {
        const url = (await getUnsplashImage(activity.place_name)) || "/placeholder.jpg";
        if (isMounted) setImg(url);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [activity?.place_name, initialImage]);

  return (
    <div className="flex gap-4">
      <div className="relative h-28 w-40 overflow-hidden rounded-md border bg-muted">
        {img ? (
          <Image src={img} alt={`${activity.place_name} photo`} fill className="object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h5 className="font-medium truncate">{activity.place_name}</h5>
        <p className="text-sm text-muted-foreground line-clamp-2">{activity.place_details}</p>
        <p className="text-xs text-muted-foreground">{activity.place_address}</p>
        <div className="mt-2">
          <a
            href={googleMapsUrlFromQuery(`${activity.place_name}${activity.place_address ? `, ${activity.place_address}` : ""}`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs rounded-md border px-2 py-1 hover:bg-accent"
          >
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );
}
