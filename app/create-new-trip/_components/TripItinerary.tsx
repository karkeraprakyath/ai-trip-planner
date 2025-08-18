import React from "react";
import ActivityCard from "./ActivityCard";

interface TripItineraryProps {
  itinerary?: any;
  onBack?: () => void;
}

const TripItinerary: React.FC<TripItineraryProps> = ({ itinerary, onBack }) => {
  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No trip data available</p>
      </div>
    );
  }

  return (
    <div className="h-[85vh] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Trip Itinerary</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Chat
            </button>
          )}
        </div>

        {/* Display trip plan data */}
        <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Destination:</strong> {itinerary.trip_plan?.destination || 'N/A'}</p>
              <p><strong>Duration:</strong> {itinerary.trip_plan?.duration || 'N/A'}</p>
              <p><strong>Origin:</strong> {itinerary.trip_plan?.origin || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Budget:</strong> {itinerary.trip_plan?.budget || 'N/A'}</p>
              <p><strong>Group Size:</strong> {itinerary.trip_plan?.group_size || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Display hotels */}
        {itinerary.trip_plan?.hotels && itinerary.trip_plan.hotels.length > 0 && (
          <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Recommended Hotels</h2>
            <div className="grid gap-4">
              {itinerary.trip_plan.hotels.map((hotel: any) => (
                <div key={hotel.hotel_name} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{hotel.hotel_name}</h3>
                      <p className="text-muted-foreground">{hotel.hotel_address}</p>
                      <p className="text-green-600 font-medium">${hotel.price_per_night}</p>
                      <p className="text-sm text-muted-foreground">Rating: {hotel.rating}/5</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotel_name + (hotel.hotel_address ? ", " + hotel.hotel_address : ""))}`}
                      target="_blank" rel="noreferrer"
                      className="shrink-0 text-sm rounded-md border px-3 py-1.5 hover:bg-accent"
                    >
                      View on Maps
                    </a>
                  </div>
                  {hotel.description && <p className="text-sm mt-2 text-muted-foreground">{hotel.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display itinerary */}
        {itinerary.trip_plan?.itinerary && itinerary.trip_plan.itinerary.length > 0 && (
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Itinerary</h2>
            <div className="space-y-6">
              {itinerary.trip_plan.itinerary.map((day: any) => (
                <div key={`day-${day.day}`} className="border rounded-lg p-4">

                  <h3 className="font-semibold text-lg mb-3">Day {day.day}</h3>
                  <p className="text-muted-foreground mb-3">{day.day_plan}</p>
                  <p className="text-sm text-blue-600">Best time to visit: {day.best_time_to_visit_day}</p>

                  {day.activities && day.activities.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium">Activities:</h4>
                      {day.activities.map((activity: any) => (
                        <div key={`${day.day}-${activity.place_name}`} className="ml-4 border-l-2 border-blue-200 pl-4">
                          <ActivityCard activity={activity} />
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Ticket: {activity.ticket_pricing}</div>
                            <div>Travel: {activity.time_travel_each_location}</div>
                            <div className="col-span-2">Best time: {activity.best_time_to_visit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Show raw data if structure is different */}
        {(!itinerary.trip_plan || (!itinerary.trip_plan.hotels && !itinerary.trip_plan.itinerary)) && (
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trip Data</h2>
            <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripItinerary;

