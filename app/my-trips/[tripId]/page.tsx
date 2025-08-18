"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { getUnsplashImage } from "@/app/api/unsplashlib/unsplash";

export default function TripDetailsPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const trip = useQuery(api.trips.getTripById, params?.tripId ? { tripId: params.tripId as any } : "skip");

  const [coverUrl, setCoverUrl] = useState<string>("/placeholder.jpg");
  const fetchedRef = useRef(false);
  const [activityImages, setActivityImages] = useState<Record<string, string>>({});
  const allowedHosts = new Set(["images.unsplash.com", "plus.unsplash.com", "images.pexels.com", "example.com"]);
  const isAllowedHost = (url?: string) => {
    if (!url) return false;
    try {
      const host = new URL(url).hostname;
      return allowedHosts.has(host);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!trip) return;
    const hotelUrl = trip?.hotels?.[0]?.hotel_image_url as string | undefined;
    if (hotelUrl && isAllowedHost(hotelUrl) && !hotelUrl.includes("example.com")) {
      setCoverUrl(hotelUrl);
      return;
    }
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      getUnsplashImage(`${trip.destination} travel city`).then((url) => {
        if (url) setCoverUrl(url);
      }).catch(() => {});
    }
  }, [trip]);

  // Fetch Unsplash images for activities missing images
  useEffect(() => {
    if (!trip?.itinerary?.length) return;
    (async () => {
      for (const day of trip.itinerary as any[]) {
        if (!day?.activities?.length) continue;
        for (let idx = 0; idx < day.activities.length; idx++) {
          const act = day.activities[idx];
          const key = `${day._id}-${idx}`;
          const existing = act?.place_image_url as string | undefined;
          if (existing && isAllowedHost(existing) && !existing.includes("example.com")) continue;
          if (activityImages[key]) continue;
          try {
            const url = await getUnsplashImage(`${act.place_name} ${trip.destination}`);
            if (url) {
              setActivityImages(prev => ({ ...prev, [key]: url }));
            }
          } catch {}
        }
      }
    })();
  }, [trip]);

  if (trip === undefined) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground">Loading trip...</p>
      </div>
    );
  }

  if (trip === null) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground">Trip not found.</p>
        <div className="mt-4">
          <Link href="/my-trips" className="underline">Back to My Trips</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{trip.destination}</h1>
          <p className="text-sm text-muted-foreground">From {trip.origin} • {trip.duration} • Budget {trip.budget} • Group {trip.group_size}</p>
        </div>
        <Link href="/my-trips" className="underline">Back to My Trips</Link>
      </div>

      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border bg-muted">
      <Image src={coverUrl} alt={trip.destination} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Hotels */}
      {trip.hotels?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Hotels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trip.hotels.map((h: any, idx: number) => {
              const hotelImg = isAllowedHost(h.hotel_image_url) && !String(h.hotel_image_url).includes("example.com")
                ? h.hotel_image_url
                : undefined;
              const fallback = hotelImg || coverUrl || "/placeholder.jpg";
              return (
              <div key={idx} className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="relative w-full aspect-[4/3] bg-muted">
                  <Image src={fallback} alt={h.hotel_name} fill className="object-cover transition-transform duration-300 hover:scale-[1.02]" />
                  <div className="absolute bottom-2 left-2 inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white/85 text-foreground shadow-sm">
                    {h.price_per_night}
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate" title={h.hotel_name}>{h.hotel_name}</h3>
                    <span className="text-xs text-muted-foreground">{h.rating?.toFixed?.(1) ?? h.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{h.hotel_address}</p>
                </div>
              </div>
            );})}
          </div>
        </section>
      ) : null}

      {/* Itinerary */}
      {trip.itinerary?.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Itinerary</h2>
          <div className="space-y-5">
            {trip.itinerary.map((day: any) => (
              <div key={day._id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Day {day.day}</h3>
                  <span className="text-xs text-muted-foreground">{day.best_time_to_visit_day}</span>
                </div>
                <p className="text-sm text-muted-foreground">{day.day_plan}</p>
                {day.activities?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {day.activities.map((act: any, idx: number) => {
                      const key = `${day._id}-${idx}`;
                      const actImg = (!act.place_image_url || act.place_image_url.includes("example.com"))
                        ? (activityImages[key] || "/placeholder.jpg")
                        : act.place_image_url;
                      return (
                      <div key={idx} className="rounded-lg border overflow-hidden bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                        <div className="relative w-full aspect-[4/3] bg-muted">
                          <Image src={actImg} alt={act.place_name} fill className="object-cover" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white/85 text-foreground shadow-sm">{act.ticket_pricing}</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white/85 text-foreground shadow-sm">{act.best_time_to_visit}</span>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="font-medium truncate" title={act.place_name}>{act.place_name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{act.place_address}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}


