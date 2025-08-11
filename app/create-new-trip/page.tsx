"use client";

import React, { useState } from 'react'
import Chatbox from './_components/Chatbox'
import Itinerarry from './_components/Itinerarry'

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
  const [tripData, setTripData] = useState<TripPlan | null>(null);
  const [showTrip, setShowTrip] = useState(false);

  const handleShowTrip = (show: boolean) => {
    console.log("Showing trip:", show);
    setShowTrip(show);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-10 h-screen">
      <div className="h-full overflow-hidden">
        <Chatbox 
          setTripItinerary={setTripData}
          setShowTrip={handleShowTrip}
          showTrip={showTrip}
        />
      </div>
      <div className="h-full overflow-auto border-l">
        {tripData ? (
          <Itinerarry tripData={tripData} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No trip itinerary available. Generate a trip to view details.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateNewTrip
