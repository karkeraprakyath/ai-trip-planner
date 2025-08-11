// app/create-new-trip/_components/Chatbox.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Loader, Send, Globe2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import SelectDaysUi from "./SelectDaysUi";
import FinalUi from "./FinalUi";

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

type Message = {
  role: string;
  content: string;
  ui?: string | null;
};

interface ChatboxProps {
  setTripItinerary: (itinerary: TripPlan | null) => void;
  setShowTrip: (show: boolean) => void;
  showTrip: boolean;
}

function Chatbox({ setTripItinerary, setShowTrip, showTrip }: ChatboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFinalMode, setIsFinalMode] = useState(false);
  const [tripItinerary, setTripItineraryLocal] = useState<TripPlan | null>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessagesToApi = async (payloadMessages: Message[], isFinal = false) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/aimodel", {
        messages: payloadMessages,
        isFinal,
      });
      return res.data;
    } catch (err) {
      console.error("API call error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const safeParseTripData = (data: any): TripPlan | null => {
    try {
      let parsedData;
      if (typeof data?.resp === "string") {
        parsedData = JSON.parse(data.resp);
      } else if (typeof data === "string") {
        parsedData = JSON.parse(data);
      } else {
        parsedData = data;
      }
      console.log("Parsed Trip Data:", parsedData);
      return parsedData;
    } catch (error) {
      console.warn("⚠ Could not parse trip data:", error);
      return null;
    }
  };

  const onSend = async (overrideUserInput?: string) => {
    const contentToSend = overrideUserInput ?? userInput;
    if (!contentToSend?.trim()) return;

    const newMsg: Message = { role: "user", content: contentToSend };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setUserInput("");

    try {
      const data = await sendMessagesToApi(updatedMessages, false);

      if (!data) return;

      if (data.ui === "final") {
        const tripData = safeParseTripData(data);
        if (tripData) {
          setTripItineraryLocal(tripData);
          setTripItinerary(tripData);
          setShowTrip(true);
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: "Your trip plan is ready! You can view the details in the panel on the right.", ui: "final" },
          ]);
        } else {
          await sendFinalTrigger([...updatedMessages]);
        }
      } else {
        const assistantBubble: Message = {
          role: "assistant",
          content: data.resp ?? data.text ?? "No response",
          ui: data.ui ?? null,
        };
        setMessages(prev => [...prev, assistantBubble]);
      }
    } catch (error: any) {
      console.error("❌ Chatbox Error:", error);
      const errMsg =
        error?.response?.data?.error ||
        "I apologize, but I'm having trouble processing your request. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg, ui: null }]);
    }
  };

  const sendFinalTrigger = async (currentConversation: Message[]) => {
    setLoading(true);
    try {
      const finalUserMsg: Message = { role: "user", content: "ok great" };
      const finalMessages = [...currentConversation, finalUserMsg];
      setIsFinalMode(true);
      setMessages(prev => [...prev, finalUserMsg]);

      const result = await sendMessagesToApi(finalMessages, true);
      const tripData = safeParseTripData(result);

      if (tripData) {
        setTripItineraryLocal(tripData);
        setTripItinerary(tripData);
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Your trip plan is ready! Click 'View Trip' to see details.", ui: "final" },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Failed to parse trip data. Please try again.", ui: null },
        ]);
      }
    } catch (err: any) {
      console.error("Final trigger error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Failed to generate final trip. Please try again.", ui: null },
      ]);
    } finally {
      setIsFinalMode(false);
      setLoading(false);
    }
  };

  const RenderGenerativeUi = (ui: string, data: TripPlan | null) => {
    switch (ui) {
      case "groupSize":
        return <GroupSizeUi onSelectedOption={(v: string) => onSend(v)} />;
      case "budget":
        return <BudgetUi onSelectedOption={(v: string) => onSend(v)} />;
      case "tripDuration":
        return <SelectDaysUi onSelectedOption={(days: number) => onSend(`${days} Days`)} />;
      case "final":
        return (
          <div className="flex flex-col items-center justify-center mt-6 p-6 bg-white rounded-2xl shadow">
            <Globe2 className="text-primary h-10 w-10 animate-spin mb-2" />
            <h2 className="mt-3 text-lg font-semibold text-primary flex items-center gap-2">
              <span>✈️</span> Your trip plan is ready!
            </h2>
            <p className="text-gray-500 text-sm text-center mt-1">
              You can view your trip details in the panel on the right.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[85vh] flex flex-col">
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto mt-8 w-full">
          <EmptyBoxState onselectOption={(v: string) => onSend(v)} />
        </div>
      )}
      <section
        ref={chatSectionRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth max-w-4xl mx-auto w-full"
      >
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <React.Fragment key={index}>
              <div className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    msg.role === "user" ? "bg-primary text-white" : "bg-muted text-black"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {msg.role === "assistant" && msg.ui && (
                <div className="flex justify-center">
                  <div className="max-w-md w-full">
                    {RenderGenerativeUi(msg.ui, tripItinerary)}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="bg-gray-100 p-4 rounded-2xl shadow-sm">
              <Loader className="animate-spin h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </section>

      <section className="w-full max-w-4xl mx-auto p-4">
        <div className="border rounded-2xl p-4 relative bg-white shadow-lg w-full">
          <Textarea
            value={userInput}
            placeholder="Start Writing"
            className="w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none"
            onChange={(event) => setUserInput(event.target.value ?? "")}
          />
          <Button
            onClick={() => onSend()}
            size="icon"
            className="absolute bottom-6 right-6 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Chatbox;