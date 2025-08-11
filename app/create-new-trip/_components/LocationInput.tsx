"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LocationInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ placeholder, onSubmit }) => {
  const [value, setValue] = useState("");
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea 
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent resize-none border rounded-lg p-2"
      />
      <Button 
        onClick={() => {
          if (value.trim()) {
            onSubmit(value);
            setValue("");
          }
        }}
        className="self-end bg-primary text-white px-4 py-2 rounded-lg"
      >
        Submit
      </Button>
    </div>
  );
};

export default LocationInput;
