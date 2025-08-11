import { suggestions } from '@/app/_components/Hero'
import React from 'react'

function EmptyBoxState({onselectOption}:any) {
  return (
    <div>
        <h2 className='font-bold text-xl text-center'>Start Planning New <strong className='text-primary'>Trip </strong>Using AI</h2>
    <p className='text-gray-400 text-center mt-2'>Discover personalized travel itineraries, find the best destinations, and plan your dream vacation effortlessly with the power of AI. Let our smart assistant do the hard work while you enjoy the journey.</p>
    
    <div className='flex flex-col gap-5 mt-7'>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={()=>onselectOption(suggestion.title)}
              className='flex  gap-2 items-center border rounded-xl p-3 cursor-pointer hover:border-primary hover:text-primary'
            >
              {suggestion.icon}
              <h2 className='text-lg'>{suggestion.title}</h2>
            </div>
          ))}
        </div>
    </div>
  )
}

export default EmptyBoxState