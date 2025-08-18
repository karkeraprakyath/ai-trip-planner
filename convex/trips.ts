import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createNewTrip = mutation({
    args: {
        destination: v.string(),
        duration: v.string(),
        origin: v.string(),
        budget: v.string(),
        group_size: v.string(),
    userId: v.id("UserTable"),
        hotels: v.array(v.object({
            hotel_name: v.string(),
            hotel_address: v.string(),
            price_per_night: v.string(),
            hotel_image_url: v.string(),
            latitude: v.number(),
            longitude: v.number(),
            rating: v.number(),
            description: v.string(),
            geo_coordinates: v.object({
                latitude: v.number(),
                longitude: v.number()
            })
        })),
        itinerary: v.array(v.object({
            day: v.number(),
            day_plan: v.string(),
            best_time_to_visit_day: v.string(),
            activities: v.array(v.object({
                place_name: v.string(),
                place_details: v.string(),
                place_image_url: v.string(),
                latitude: v.number(),
                longitude: v.number(),
                place_address: v.string(),
                ticket_pricing: v.string(),
                time_travel_each_location: v.string(),
                best_time_to_visit: v.string(),
                geo_coordinates: v.object({
                    latitude: v.number(),
                    longitude: v.number()
                })
            })),
        })),
    },
    handler: async (ctx, args) => {
        // Create the main trip record
        const tripId = await ctx.db.insert("TripTable", {
            destination: args.destination,
            duration: args.duration,
            origin: args.origin,
            budget: args.budget,
            group_size: args.group_size,
            userId: args.userId,
            createdAt: Date.now(),
        });

        // Store hotels
        await Promise.all(args.hotels.map((hotel: {
            hotel_name: string,
            hotel_address: string,
            price_per_night: string,
            hotel_image_url: string,
            latitude: number,
            longitude: number,
            rating: number,
            description: string,
            geo_coordinates: {
                latitude: number,
                longitude: number
            }
        }) =>
            ctx.db.insert("HotelTable", {
                tripId,
                hotel_name: hotel.hotel_name,
                hotel_address: hotel.hotel_address,
                price_per_night: hotel.price_per_night,
                hotel_image_url: hotel.hotel_image_url,
                latitude: hotel.latitude,
                longitude: hotel.longitude,
                rating: hotel.rating,
                description: hotel.description,
            })
        ));

        // Store itinerary and activities
        await Promise.all(args.itinerary.map(async (day: {
            day: number,
            day_plan: string,
            best_time_to_visit_day: string,
            activities: Array<{
                place_name: string,
                place_details: string,
                place_image_url: string,
                latitude: number,
                longitude: number,
                place_address: string,
                ticket_pricing: string,
                time_travel_each_location: string,
                best_time_to_visit: string,
                geo_coordinates: {
                    latitude: number,
                    longitude: number
                }
            }>
        }) => {
            const itineraryId = await ctx.db.insert("ItineraryTable", {
                tripId,
                day: day.day,
                day_plan: day.day_plan,
                best_time_to_visit_day: day.best_time_to_visit_day,
            });

            // Store activities for this day
            await Promise.all(day.activities.map((activity: {
                place_name: string,
                place_details: string,
                place_image_url: string,
                latitude: number,
                longitude: number,
                place_address: string,
                ticket_pricing: string,
                time_travel_each_location: string,
                best_time_to_visit: string
            }) =>
                ctx.db.insert("ActivityTable", {
                    itineraryId,
                    place_name: activity.place_name,
                    place_details: activity.place_details,
                    place_image_url: activity.place_image_url,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    place_address: activity.place_address,
                    ticket_pricing: activity.ticket_pricing,
                    time_travel_each_location: activity.time_travel_each_location,
                    best_time_to_visit: activity.best_time_to_visit,
                })
            ));
        }));

        return tripId;
    },
});

// Query to get trip details by ID
export const getTripById = query({
    args: {
        tripId: v.id("TripTable"),
    },
    handler: async (ctx, args) => {
        const trip = await ctx.db.get(args.tripId);
        if (!trip) return null;

        const hotels = await ctx.db
            .query("HotelTable")
            .filter((q) => q.eq(q.field("tripId"), args.tripId))
            .collect();

        const itineraries = await ctx.db
            .query("ItineraryTable")
            .filter((q) => q.eq(q.field("tripId"), args.tripId))
            .order("asc" as const)
            .collect();

        const enrichedItineraries = await Promise.all(
            itineraries.map(async (itinerary) => {
                const activities = await ctx.db
                    .query("ActivityTable")
                    .filter((q) => q.eq(q.field("itineraryId"), itinerary._id))
                    .collect();

                return {
                    ...itinerary,
                    activities,
                };
            })
        );

        return {
            ...trip,
            hotels,
            itinerary: enrichedItineraries,
        };
    },
});

// Query to get all trips for a user
export const getUserTrips = query({
    args: {
        userId: v.id("UserTable"),
    },
    handler: async (ctx, args) => {
        const trips = await ctx.db
            .query("TripTable")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc" as const)
            .collect();

        return trips;
    },
});

// Query to get trips by destination with full details
export const getTripsByDestination = query({
    args: {
        destination: v.string(),
    },
    handler: async (ctx, args) => {
        const trips = await ctx.db
            .query("TripTable")
            .filter((q) => q.eq(q.field("destination"), args.destination))
            .order("desc" as const)
            .collect();

        const enrichedTrips = await Promise.all(
            trips.map(async (trip) => {
                const hotels = await ctx.db
                    .query("HotelTable")
                    .filter((q) => q.eq(q.field("tripId"), trip._id))
                    .collect();

                const itineraries = await ctx.db
                    .query("ItineraryTable")
                    .filter((q) => q.eq(q.field("tripId"), trip._id))
                    .order("asc" as const)
                    .collect();

                const enrichedItineraries = await Promise.all(
                    itineraries.map(async (itinerary) => {
                        const activities = await ctx.db
                            .query("ActivityTable")
                            .filter((q) => q.eq(q.field("itineraryId"), itinerary._id))
                            .collect();

                        return {
                            ...itinerary,
                            activities,
                        };
                    })
                );

                return {
                    ...trip,
                    hotels,
                    itinerary: enrichedItineraries,
                };
            })
        );

        return enrichedTrips;
    },
});
