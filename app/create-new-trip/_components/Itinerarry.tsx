
import React from 'react';
import { Timeline } from "@/components/ui/timeline";
import Image from 'next/image';
import { Star, Wallet, MapPin, Clock, Ticket, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItineraryProps {
  tripData: any;
  onBack?: () => void; // Optional back button callback
}

function Itinerary({ tripData, onBack }: ItineraryProps) {
  if (!tripData || !tripData.trip_plan) {
    return (
      <div className="flex items-center justify-center h-[83vh] text-gray-500">
        <p>No trip data available. Please generate a trip first.</p>
      </div>
    );
  }

  const data = [
    {
      title: <div className="text-xl font-semibold mb-4">Trip Overview</div>,
      content: (
        <div className="space-y-4">
          <div className="text-xl font-bold">{tripData?.trip_plan.destination} Trip</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>From:</strong> {tripData?.trip_plan.origin}</p>
            <p><strong>Duration:</strong> {tripData?.trip_plan.duration}</p>
            <p><strong>Budget:</strong> {tripData?.trip_plan.budget}</p>
            <p><strong>Group Size:</strong> {tripData?.trip_plan.group_size}</p>
          </div>
        </div>
      ),
    },
    {
      title: <div className="text-xl font-semibold mb-4">Recommended Hotels</div>,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tripData?.trip_plan.hotels?.map((hotel, index) => (
            <div key={index} className="flex flex-col gap-1">
              <Image
                src={hotel.hotel_image_url || "/placeholder.jpg"}
                alt="hotel image"
                width={400}
                height={200}
                className="rounded-xl shadow object-cover"
              />
              <h2 className="font-semibold text-lg">{hotel?.hotel_name}</h2>
              <h2 className="text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {hotel?.hotel_address}
              </h2>
              <div className="flex justify-between items-center">
                <p className="flex gap-2 text-green-500">
                  <Wallet className="h-4 w-4" /> {hotel.price_per_night}
                </p>
                <p className="text-yellow-300 flex gap-2">
                  <Star className="h-4 w-4" /> {hotel.rating}
                </p>
              </div>
              <p className="line-clamp-2 text-gray-500">{hotel.description}</p>
              <Button
                variant="outline"
                className="mt-1"
                onClick={() =>
                  window.open(
                    `https://maps.google.com/?q=${hotel.geo_coordinates.latitude},${hotel.geo_coordinates.longitude}`,
                    "_blank"
                  )
                }
              >
                View on Map
              </Button>
            </div>
          )) || <p>No hotels available.</p>}
        </div>
      ),
    },
    {
      title: <div className="text-xl font-semibold mb-4">Daily Itinerary</div>,
      content: (
        <div className="space-y-6">
          {tripData?.trip_plan.itinerary?.map((day) => (
            <div key={`day-${day.day}`} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Day {day.day}: {day.day_plan}</h3>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Best time to visit: {day.best_time_to_visit_day}
              </p>
              {day.activities && day.activities.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium">Activities:</h4>
                  {day.activities.map((activity) => (
                    <div key={`${day.day}-${activity.place_name}`} className="ml-4 border-l-2 border-blue-200 pl-4">
                      <Image
                        src={activity.place_image_url || "/placeholder.jpg"}
                        alt="activity image"
                        width={300}
                        height={150}
                        className="rounded-xl shadow object-cover mb-2"
                      />
                      <h5 className="font-medium">{activity.place_name}</h5>
                      <p className="text-sm text-gray-600">{activity.place_details}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {activity.place_address}
                      </p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Ticket className="h-4 w-4" /> Ticket: {activity.ticket_pricing}
                      </p>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Travel time: {activity.time_travel_each_location}
                      </p>
                      <p className="text-sm text-orange-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Best time: {activity.best_time_to_visit}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-1"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${activity.geo_coordinates.latitude},${activity.geo_coordinates.longitude}`,
                            "_blank"
                          )
                        }
                      >
                        View on Map
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activities for this day.</p>
              )}
            </div>
          )) || <p>No itinerary available.</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full h-[83vh] overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mb-6">
            ← Back to Chat
          </Button>
        )}
        <Timeline data={data} />
      </div>
    </div>
  );
}

export default Itinerary;