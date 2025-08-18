"use client";
import React, { useState } from "react";
import Chatbox from './Chatbox';
import TripItinerary from "./TripItinerary";
import Image from "next/image";
interface TripPlan {
  trip_plan: {
    destination: string;
    duration: string;
    origin: string;
    budget: string;
    group_size: string;
    hotels: Array<{
      hotel_name: string;
      hotel_address: string;
      price_per_night: string;
      hotel_image_url: string;
      geo_coordinates: { latitude: number; longitude: number };
      rating: number;
      description: string;
    }>;
    itinerary: Array<{
      day: number;
      day_plan: string;
      best_time_to_visit_day: string;
      activities: Array<{
        place_name: string;
        place_details: string;
        place_image_url: string;
        geo_coordinates: { latitude: number; longitude: number };
        place_address: string;
        ticket_pricing: string;
        time_travel_each_location: string;
        best_time_to_visit: string;
      }>;
    }>;
  };
}

function CreateNewTrip() {
  const [tripItinerary, setTripItinerary] = useState<TripPlan | null>(null);
  const [showTrip, setShowTrip] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5 p-6 md:p-10 h-[85vh]">
      <div className="md:col-span-2 h-full">
        <Chatbox
          itinerary={tripItinerary}
          setTripItinerary={setTripItinerary}
          setShowTrip={setShowTrip}
          showTrip={showTrip}
        />
      </div>
      <div className="md:col-span-3 h-full">
        {showTrip && tripItinerary ? (
          <TripItinerary
            itinerary={tripItinerary}
            onBack={() => setShowTrip(false)}
          />
        ) : (
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <Image
              src="https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg"
              alt="Travel Planning"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateNewTrip;