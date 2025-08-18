/** @format */

import React from "react";
export const SelectTravelestList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A solo traveler in exploration",
    icon: "🧳",
    people: "1",
  },
  {
    id: 2,
    title: "A Couple",
    desc: "Two travelers in tandem",
    icon: "👫",
    people: "2 People",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun-loving adventurers",
    icon: "👨‍👩‍👧‍👦",
    people: "3 to 5 People",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A bunch of thrill-seekers",
    icon: "🏄‍♂️",
    people: "5 to 10 People",
  },
];
function GroupSizeUi({ onSelectedOption }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch mt-1">
      {SelectTravelestList.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={`${item.title} (${item.people})`}
          onClick={() => onSelectedOption(item.title + " :" + item.people)}
          className="group flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border bg-card/60 p-4 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-2xl md:text-3xl leading-none">{item.icon}</span>
          <span className="mt-1 text-sm font-medium">{item.title}</span>
          <span className="hidden md:block text-xs text-muted-foreground">{item.people}</span>
        </button>
      ))}
    </div>
  );
}

export default GroupSizeUi;
