"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getUnsplashImage } from "@/app/api/unsplashlib/unsplash";

type TripRecord = {
	_id: string;
	destination: string;
	duration: string;
	origin: string;
	budget: string;
	group_size: string;
	createdAt: number;
};

function formatDate(ms: number) {
	try {
		return new Date(ms).toLocaleDateString();
	} catch {
		return "";
	}
}

function TripCard({ trip }: { trip: TripRecord }) {
	const details = useQuery(api.trips.getTripById, { tripId: trip._id as any } as any);
	const [coverUrl, setCoverUrl] = useState<string>("/placeholder.jpg");
	const fetchedRef = useRef(false);

	useEffect(() => {
		const hotelUrl = details?.hotels?.[0]?.hotel_image_url as string | undefined;
		if (hotelUrl && !hotelUrl.includes("example.com")) {
			setCoverUrl(hotelUrl);
			return;
		}
		if (!fetchedRef.current) {
			fetchedRef.current = true;
			getUnsplashImage(`${trip.destination} city travel`).then((url) => {
				if (url) setCoverUrl(url);
			}).catch(() => {});
		}
	}, [details, trip.destination]);

	return (
		<Link href={`/my-trips/${trip._id}`} className="block group">
			<div className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
				<div className="relative w-full aspect-[4/3] bg-muted">
					<Image src={coverUrl} alt={trip.destination} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
					<div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
						<span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white/85 text-foreground shadow-sm">
							{trip.duration}
						</span>
						<span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-white/85 text-foreground shadow-sm">
							{trip.group_size}
						</span>
					</div>
				</div>
				<div className="p-3 space-y-1">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold truncate" title={trip.destination}>{trip.destination}</h3>
						<span className="text-xs text-muted-foreground">{formatDate(trip.createdAt)}</span>
					</div>
					<p className="text-xs md:text-sm text-muted-foreground truncate">From {trip.origin}</p>
					<p className="text-xs md:text-sm text-muted-foreground">Budget: {trip.budget}</p>
				</div>
			</div>
		</Link>
	);
}

export default function MyTrips() {
	const { user, isLoaded } = useUser();
	const convexUser = useQuery(api.user.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
	const trips = useQuery(api.trips.getUserTrips, convexUser?._id ? { userId: convexUser._id as any } : "skip") as TripRecord[] | undefined;

	if (!isLoaded) return null;

	if (!user) {
		return (
			<div className="p-8 max-w-5xl mx-auto text-center">
				<h2 className="text-2xl font-semibold">My Trips</h2>
				<p className="mt-2 text-muted-foreground">Please sign in to view your saved trips.</p>
				<div className="mt-4">
					<Link className="underline" href="/sign-in">Go to Sign In</Link>
				</div>
			</div>
		);
	}

	if (!trips) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="flex items-end justify-between mb-6">
					<h2 className="text-2xl font-semibold">My Trips</h2>
					<div className="h-4 w-24 rounded bg-muted animate-pulse" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="rounded-xl border bg-card overflow-hidden">
							<div className="relative w-full aspect-[4/3] bg-muted animate-pulse" />
							<div className="p-3 space-y-2">
								<div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
								<div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
								<div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 md:p-10 max-w-7xl mx-auto">
			<div className="flex items-end justify-between mb-6">
				<h2 className="text-2xl md:text-3xl font-bold">My Trips</h2>
				<span className="text-sm text-muted-foreground">{trips.length} trip{trips.length === 1 ? "" : "s"}</span>
			</div>
			{trips.length === 0 ? (
				<div className="text-center py-16 border rounded-xl bg-card">
					<p className="text-muted-foreground">No trips yet. Create your first trip to see it here.</p>
					<div className="mt-4">
						<Link href="/create-new-trip" className="underline">Create New Trip</Link>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{trips.map((trip) => (
						<TripCard key={trip._id} trip={trip} />
					))}
				</div>
			)}
		</div>
	);
}


