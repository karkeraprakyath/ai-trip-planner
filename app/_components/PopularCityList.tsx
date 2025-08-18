"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

export function PopularCityList() {
  const cards = data.map((card, index) => {
    const trips = useQuery(api.trips.getTripsByDestination, {
      destination: card.category.split(',')[0]
    });

    const content = trips ? (
      <div className="space-y-8">
        {trips.map((trip, idx) => (
          <div key={idx} className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {trip.origin} to {trip.destination}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Duration: {trip.duration} • Budget: {trip.budget} • Group Size: {trip.group_size}
                </p>
              </div>
            </div>

            {/* Hotels Section */}
            {trip.hotels.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-neutral-900 dark:text-white">
                  Recommended Hotels
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.hotels.map((hotel, hotelIdx) => (
                    <div key={hotelIdx} className="relative rounded-lg overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <Image
                          src={hotel.hotel_image_url}
                          alt={hotel.hotel_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-700">
                        <h5 className="font-medium text-neutral-900 dark:text-white">
                          {hotel.hotel_name}
                        </h5>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {hotel.price_per_night} per night • Rating: {hotel.rating}⭐
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Section */}
            {trip.itinerary.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-neutral-900 dark:text-white">
                  Itinerary
                </h4>
                <div className="space-y-4">
                  {trip.itinerary.map((day, dayIdx) => (
                    <div key={dayIdx} className="border-l-2 border-blue-500 pl-4">
                      <h5 className="font-medium text-neutral-900 dark:text-white">
                        Day {day.day}
                      </h5>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                        {day.day_plan}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {day.activities.map((activity, actIdx) => (
                          <div key={actIdx} className="relative rounded-lg overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9 relative">
                              <Image
                                src={activity.place_image_url}
                                alt={activity.place_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-700">
                              <h6 className="font-medium text-neutral-900 dark:text-white">
                                {activity.place_name}
                              </h6>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {activity.time_travel_each_location} • {activity.ticket_pricing}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500 dark:text-neutral-400">Loading trips...</p>
      </div>
    );

    return (
      <Card
        key={card.src}
        card={{
          ...card,
          content: content,
        }}
        index={index}
      />
    );
  });

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-3xl font-bold text-foreground font-sans">
        Popular destinations to visit
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            <img
              src="https://assets.aceternity.com/macbook.png"
              alt="Macbook mockup from Aceternity UI"
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
            />
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    category: "Paris, France",
    title: "Explore the City of Lights – Eiffel Tower, Louvre & more!",
    src: "https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg",
    content: <DummyContent />,
  },
  {
    category: "New York, USA",
    title: "Experience NYC – Times Square, Central Park, Broadway",
    src: "https://images.pexels.com/photos/1089194/pexels-photo-1089194.jpeg",
    content: <DummyContent />,
  },
  {
    category: "Tokyo, Japan",
    title: "Discover Tokyo – Shibuya, Cherry Blossoms, Temples",
    src: "https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg",
    content: <DummyContent />,
  },
  {
    category: "Rome, Italy",
    title: "Walk through History – Colosseum, Vatican, Roman Forum",
    src: "https://images.pexels.com/photos/33168227/pexels-photo-33168227.jpeg",
    content: <DummyContent />,
  },
  {
    category: "Dubai, UAE",
    title: "Luxury and Innovation – Burj Khalifa, Desert Safari",
    src: "https://images.pexels.com/photos/12280870/pexels-photo-12280870.jpeg",
    content: <DummyContent />,
  },
  {
    category: "India",
    title: "Harbour Views – Opera House, Bondi Beach & Wildlife",
    src: "https://images.pexels.com/photos/31991708/pexels-photo-31991708.jpeg",
    content: <DummyContent />,
  },
];

