import React from 'react'
export const SelectBudgetOptions = [
  {
    id: 1,
    titles: 'Cheap',
    desc: 'Stay conscious of costs',
    icon: '🟩',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 2,
    titles: 'Moderate',
    desc: 'Keep cost on the average side',
    icon: '🔥',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 3,
    titles: 'Luxury',
    desc: 'Don\'t worry about cost',
    icon: '🟢',
    color: 'bg-purple-100 text-purple-600'
  }
]
function BudgetUi({ onSelectedOption }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-stretch mt-1">
      {SelectBudgetOptions.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={`${item.titles} — ${item.desc}`}
          onClick={() => onSelectedOption(item.titles + " :" + item.desc)}
          className="group flex min-h-28 flex-col items-center justify-center rounded-xl border bg-card/60 p-4 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={`mb-1 grid place-items-center rounded-full px-3 py-2 text-xl ${item.color}`}>{item.icon}</span>
          <span className='mt-1 text-sm font-medium'>{item.titles}</span>
          <span className='hidden md:block text-xs text-muted-foreground'>{item.desc}</span>
        </button>
      ))}
    </div>
  )
}

export default BudgetUi