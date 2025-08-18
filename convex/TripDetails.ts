import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createNewTrip = mutation({
    args: {
        tripData: v.object({
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
                })),
            })),
        }),
    },
    handler: async (ctx, { tripData }) => {
        const tripId = await ctx.db.insert("TripTable", {
            destination: tripData.destination,
            duration: tripData.duration,
            origin: tripData.origin,
            budget: tripData.budget,
            group_size: tripData.group_size,
            userId: tripData.userId,
            createdAt: Date.now(),
        });

        // Store hotels
        await Promise.all(tripData.hotels.map(hotel =>
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
        await Promise.all(tripData.itinerary.map(async day => {
            const itineraryId = await ctx.db.insert("ItineraryTable", {
                tripId,
                day: day.day,
                day_plan: day.day_plan,
                best_time_to_visit_day: day.best_time_to_visit_day,
            });

            // Store activities for this day
            await Promise.all(day.activities.map(activity =>
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

// Query to get a trip by ID
export const getTripById = query({
    args: { tripId: v.id("TripTable") },
    handler: async (ctx, { tripId }) => {
        const trip = await ctx.db.get(tripId);
        if (!trip) return null;

        const hotels = await ctx.db
            .query("HotelTable")
            .filter(q => q.eq(q.field("tripId"), tripId))
            .collect();

        const itineraries = await ctx.db
            .query("ItineraryTable")
            .filter(q => q.eq(q.field("tripId"), tripId))
            .collect();

        const enrichedItineraries = await Promise.all(
            itineraries.map(async itinerary => {
                const activities = await ctx.db
                    .query("ActivityTable")
                    .filter(q => q.eq(q.field("itineraryId"), itinerary._id))
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