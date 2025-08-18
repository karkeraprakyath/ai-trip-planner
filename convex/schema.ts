import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        clerkId: v.optional(v.string()),
        subscription: v.optional(v.string()),
    }),

    TripTable: defineTable({
        destination: v.string(),
        duration: v.string(),
        origin: v.string(),
        budget: v.string(),
        group_size: v.string(),
        userId: v.id("UserTable"),
        createdAt: v.number(),
    }),

    HotelTable: defineTable({
        tripId: v.id("TripTable"),
        hotel_name: v.string(),
        hotel_address: v.string(),
        price_per_night: v.string(),
        hotel_image_url: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        rating: v.number(),
        description: v.string(),
    }),

    ItineraryTable: defineTable({
        tripId: v.id("TripTable"),
        day: v.number(),
        day_plan: v.string(),
        best_time_to_visit_day: v.string(),
    }),

    ActivityTable: defineTable({
        itineraryId: v.id("ItineraryTable"),
        place_name: v.string(),
        place_details: v.string(),
        place_image_url: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        place_address: v.string(),
        ticket_pricing: v.string(),
        time_travel_each_location: v.string(),
        best_time_to_visit: v.string(),
    })
});