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
function BudgetUi({onSelectedOption}:any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center mt-1">
          {SelectBudgetOptions.map((item, index) => (
            <div key={index} className="p-3 border rounded-2xl bg-white hover:border-primary cursor-pointer items-center text-center"
            onClick={() => onSelectedOption(item.titles+" :"+item.desc)}>
             <div className={`text-3xl p-3 rounded-full ${item.color}`}>
{item.icon}</div>
              <h2 className='text-lg font-semibold mt-2'>{item.titles}</h2>
              <p className='text-sm text-gray-400'>{item.desc}</p>
            </div>
          ))}
        </div>
  );
}

export default BudgetUi