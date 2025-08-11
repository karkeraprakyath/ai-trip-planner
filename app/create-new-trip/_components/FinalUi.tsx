// Fixed FinalUi.tsx
// Changes:
// - Added check for itinerary readiness.
// - Improved button disabling logic.
// - Added loading spinner if itinerary is null.
// - Enhanced styling for better UX.

import React from "react";
import { Button } from "@/components/ui/button";
import { Globe2, Loader2 } from "lucide-react";

interface FinalUiProps {
  viewTrip: () => void;
  itinerary: any;
}

function FinalUi({ viewTrip, itinerary }: FinalUiProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-6 p-6 bg-white rounded-2xl shadow">
      <Globe2 className="text-primary h-10 w-10 animate-spin mb-2" />
      <h2 className="mt-3 text-lg font-semibold text-primary flex items-center gap-2">
        <span>✈️</span> Your dream trip is ready!
      </h2>
      <p className="text-gray-500 text-sm text-center mt-1">
        We've curated the best destinations, activities, and details just for you.
      </p>
      <Button 
        disabled={!itinerary} 
        onClick={viewTrip}
        className="mt-4 w-full"
      >
        {itinerary ? "View Trip" : <Loader2 className="h-4 w-4 animate-spin" />}
      </Button>
    </div>
  );
}

export default FinalUi;