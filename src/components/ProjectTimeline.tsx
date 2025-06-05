import React from 'react'

interface ProjectTimelineProps {
  status: string
}

const steps = [
  'Draft',
  'Live',
  'Picked Up',
  'Initial Payment',
  'Scope Defined',
  'Submitted',
  'Draft Payment',
  'Revisions',
  'Approved',
  'Final Payment',
  'Completed'
]

export default function ProjectTimeline({ status }: ProjectTimelineProps) {
  const currentIndex = steps.indexOf(status)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between space-x-2">
        {steps.map((step, idx) => {
          const isComplete = idx < currentIndex
          const isCurrent = idx === currentIndex
          const isPayment = step.includes('Payment')
          return (
            <div key={step} className="flex-1 min-w-[80px] text-center">
              <div
                className={`mx-auto mb-1 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isComplete
                    ? isPayment 
                      ? 'bg-[#00A499] text-white'
                      : 'bg-[#00A499] text-white'
                    : isCurrent
                    ? isPayment
                      ? 'bg-[#00A499] text-white'
                      : 'bg-[#2E3A8C] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <p className={`text-xs ${isCurrent ? 'font-semibold text-[#2E3A8C]' : 'text-gray-600'}`}>
                {step}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}