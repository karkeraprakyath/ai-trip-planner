// app/create-new-trip/_components/Chatbox.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Loader, Send, Save } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import SelectDaysUi from "./SelectDaysUi";
import FinalUi from "./FinalUi";
import InterestUi from "./InterestUi";
import { useUser } from "@clerk/nextjs";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

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

interface ChatboxProps {
  itinerary: TripPlan | null;
  setTripItinerary: (itinerary: TripPlan | null) => void;
  setShowTrip: (show: boolean) => void;
  showTrip: boolean;
}

type Message = {
  role: string;
  content: string;
  ui?: string | null;
};

function Chatbox({ itinerary, setTripItinerary, setShowTrip, showTrip }: ChatboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFinalMode, setIsFinalMode] = useState(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep user's previous choices to avoid re-displaying the same UI steps
  const [selectedGroupSize, setSelectedGroupSize] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string | null>(null);

  useEffect(() => {
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [userInput]);

  const { user } = useUser();
  const saveTrip = useMutation(api.trips.createNewTrip);
  const createNewUser = useMutation(api.user.CreateNewUser);
  const getUserByClerkIdMutation = useMutation(api.user.getUserByClerkIdMutation);
  const [isSaving, setIsSaving] = useState(false);

  const getOrCreateUser = async () => {
    if (!user) return null;
    try {
      // Create/Update user in Convex
      const userData = await createNewUser({
        clerkId: user.id,
        name: user.fullName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        imageUrl: user.imageUrl || '',
      });
      
      // Get user by Clerk ID to get their Convex ID
      const convexUser = await getUserByClerkIdMutation({ clerkId: user.id });
      return convexUser;
    } catch (error) {
      console.error("Error getting/creating user:", error);
      return null;
    }
  };

  const handleSaveTrip = async (tripData: TripPlan) => {
    if (!user) {
      alert("Please sign in to save your trip");
      return;
    }

    setIsSaving(true);
    try {
      // Get or create user to get their Convex ID
      const convexUser = await getOrCreateUser();
      if (!convexUser) {
        throw new Error("Failed to get or create user");
      }

      const plan = tripData.trip_plan;
      const savedTripId = await saveTrip({
        destination: plan.destination,
        duration: plan.duration,
        origin: plan.origin,
        budget: plan.budget,
        group_size: plan.group_size,
        hotels: plan.hotels.map(hotel => ({
          ...hotel,
          latitude: hotel.geo_coordinates.latitude,
          longitude: hotel.geo_coordinates.longitude,
        })),
        itinerary: plan.itinerary.map(day => ({
          ...day,
          activities: day.activities.map(activity => ({
            ...activity,
            latitude: activity.geo_coordinates.latitude,
            longitude: activity.geo_coordinates.longitude,
          })),
        })),
        userId: convexUser._id, // Use the Convex ID
      });
      alert("Trip saved successfully!");
      console.log("Saved trip ID:", savedTripId);
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const sendMessagesToApi = async (payloadMessages: Message[], isFinal = false) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/aimodel", {
        messages: payloadMessages,
        isFinal,
      });
     
      if (res.status === 429 || res.data?.ui === 'limit') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Your daily free limit is exceeded. Subscribe to generate more trip plans.', ui: null },
        ]);
        return res.data;
      }
      
    
      if (isFinal && res.data.trip_plan) {
        setTripItinerary(res.data);
        setShowTrip(true);
      }
      
      return res.data;
    } catch (err: any) {
      console.error("API call error:", err);
      // If rate limited
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 429 || data?.ui === 'limit') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Your daily free limit is exceeded. Subscribe on the Pricing page to continue.', ui: null },
        ]);
        return { ui: 'limit', resp: data?.resp ?? 'Limit exceeded' };
      }
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
          setTripItinerary(tripData);
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: "Here is your generated plan.", ui: "final" },
          ]);
        } else {
          await sendFinalTrigger([...updatedMessages]);
        }
      } else {
        // Determine UI type; infer from text (even if backend provides a mismatched type)
        let uiType = (data.ui as string | null) ?? null;
        const contentText = data.resp ?? data.text ?? "No response";

        const inferUiTypeFromText = (text: string): string | null => {
          const t = text.toLowerCase();
          if (t.includes('interest') || t.includes('what do you like') || t.includes('activities') || t.includes('prefer')) {
            return 'interests';
          }
          if (t.includes('how many days') || t.includes('number of days') || t.includes('days') || t.includes('duration')) {
            return 'tripDuration';
          }
          if (t.includes('budget') || t.includes('cost') || t.includes('price range') || t.includes('cheap') || t.includes('moderate') || t.includes('luxury')) {
            return 'budget';
          }
          if (t.includes('group size') || t.includes('how many people') || t.includes('traveler') || t.includes('traveller') || t.includes('couple') || t.includes('family') || t.includes('friends')) {
            return 'groupSize';
          }
          return null;
        };

        const inferred = inferUiTypeFromText(String(contentText));
        if (inferred) {
          uiType = inferred;
        }

        // If the model repeats a step we already answered, skip UI and auto-answer
        let autoAnswer: string | null = null;
        if (uiType === 'groupSize' && selectedGroupSize) autoAnswer = selectedGroupSize;
        if (uiType === 'budget' && selectedBudget) autoAnswer = selectedBudget;
        if (uiType === 'tripDuration' && typeof selectedDays === 'number') autoAnswer = `${selectedDays} Days`;
        if (uiType === 'interests' && selectedInterests) autoAnswer = selectedInterests;

        // Show the question bubble; attach ui only if we don't have an answer yet
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: contentText, ui: autoAnswer ? null : (uiType ?? null) },
        ]);

        if (autoAnswer) {
          // slight delay to keep UX natural
          setTimeout(() => onSend(autoAnswer as string), 50);
        }
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
    // Require sign-in before generating the final trip plan
    if (!user) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Please sign in to generate your trip plan. Visit the header to Sign In or Sign Up.', ui: null },
      ]);
      return;
    }
    setLoading(true);
    try {
      const finalUserMsg: Message = { role: "user", content: "ok great" };
      const finalMessages = [...currentConversation, finalUserMsg];
      setIsFinalMode(true);
      setMessages(prev => [...prev, finalUserMsg]);

      const result = await sendMessagesToApi(finalMessages, true);
      if (result?.ui === 'limit') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'You have reached your daily free limit. Upgrade your plan to continue.', ui: null },
        ]);
        return;
      }
      const tripData = safeParseTripData(result);

      if (tripData) {
        setTripItinerary(tripData);
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Trip generated — open the view to see details", ui: "final" },
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

  const RenderGenerativeUi = (ui: string) => {
    switch (ui) {
      case "groupSize":
        return <GroupSizeUi onSelectedOption={(v: string) => { setSelectedGroupSize(v); onSend(v); }} />;
      case "budget":
        return <BudgetUi onSelectedOption={(v: string) => { setSelectedBudget(v); onSend(v); }} />;
      case "tripDuration":
        return <SelectDaysUi onSelectedOption={(days: number) => { setSelectedDays(days); onSend(`${days} Days`); }} />;
      case "interests":
        return <InterestUi onSelectedOption={(v: string) => { setSelectedInterests(v); onSend(v); }} />;
      case "final":
        return (
          <div className="space-y-4">
            <FinalUi viewTrip={() => setShowTrip(true)} itinerary={itinerary} />
            {itinerary && (
              <Button
                onClick={() => handleSaveTrip(itinerary)}
                disabled={isSaving}
                className="w-full"
                variant="secondary"
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving Trip...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Trip
                  </>
                )}
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) onSend();
    }
  };

  return (
    <div className="h-[85vh] flex flex-col">
      {messages.length === 0 && (
        <div className="max-w-2xl mx-auto mt-8">
          <EmptyBoxState onselectOption={(v: string) => onSend(v)} />
        </div>
      )}
      <section
        ref={chatSectionRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth max-w-2xl mx-auto w-full"
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const uiContent = msg.ui ? RenderGenerativeUi(msg.ui) : null;
          return (
            <React.Fragment key={index}>
              <div className={`mt-3 flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="mr-2 size-7 shrink-0 rounded-full bg-muted text-xs grid place-items-center text-foreground/70">AI</div>
                )}
                <div
                  className={`max-w-[75%] whitespace-pre-wrap break-words px-4 py-3 rounded-2xl shadow-sm ${
                    isUser ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="ml-2 size-7 shrink-0 rounded-full bg-primary/10 text-xs grid place-items-center text-primary">You</div>
                )}
              </div>
              {msg.role === 'assistant' && uiContent && (
                <div className="mt-3 flex justify-start">
                  <div className="max-w-[75%] w-full rounded-2xl border bg-card p-4 shadow-sm">
                    {uiContent}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="bg-muted p-3 rounded-full">
              <Loader className="animate-spin h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </section>

      <section className="max-w-2xl mx-auto p-4 w-full">
        <div className="relative flex items-end gap-2 rounded-2xl border bg-card/60 p-3 shadow-sm">
          <Textarea
            ref={inputRef}
            value={userInput}
            placeholder="Type your request... Press Enter to send, Shift+Enter for a new line"
            className="w-full max-h-40 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none"
            onChange={(event) => setUserInput(event.target.value ?? "")}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <Button
            onClick={() => onSend()}
            size="icon"
            disabled={loading || !userInput.trim()}
            className="shrink-0"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Chatbox;