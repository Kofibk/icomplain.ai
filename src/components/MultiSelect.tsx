'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  required?: boolean
}

export default function MultiSelect({ options, value, onChange, required }: MultiSelectProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              isSelected
                ? 'border-green-500 bg-green-50 text-green-900'
                : 'border-gray-300 hover:border-gray-400 text-gray-900'
            }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
              isSelected ? 'bg-green-600' : 'border-2 border-gray-300'
            }`}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="flex-1">{option}</span>
          </button>
        )
      })}
      {required && value.length === 0 && (
        <p className="text-sm text-red-500 mt-2">Please select at least one option</p>
      )}
    </div>
  )
}
