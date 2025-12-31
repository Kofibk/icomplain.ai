'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => string[]
  placeholder?: string
  required?: boolean
  dark?: boolean
}

export default function AutocompleteInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Start typing...',
  required = false,
  dark = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length >= 1) {
      const searchResults = onSearch(value)
      setResults(searchResults.slice(0, 8))
      setIsOpen(searchResults.length > 0)
      setHighlightedIndex(-1)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [value, onSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          onChange(results[highlightedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (result: string) => {
    onChange(result)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? 'text-white/30' : 'text-gray-400'}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={dark
            ? "w-full pl-12 pr-10 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-lg"
            : "w-full pl-12 pr-10 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          }
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={dark
          ? "absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden"
          : "absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        }>
          {results.map((result, index) => (
            <button
              key={result}
              type="button"
              onClick={() => handleSelect(result)}
              className={dark
                ? `w-full px-4 py-3 text-left transition-colors ${index === highlightedIndex ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`
                : `w-full px-4 py-3 text-left transition-colors ${index === highlightedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-900 hover:bg-gray-50'}`
              }
            >
              {result}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
