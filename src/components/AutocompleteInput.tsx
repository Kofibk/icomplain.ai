'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Check } from 'lucide-react'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => string[]
  placeholder?: string
  required?: boolean
  className?: string
}

export default function AutocompleteInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Start typing...',
  required = false,
  className = '',
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback((query: string) => {
    if (query.length >= 1) {
      const results = onSearch(query)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setHighlightedIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [onSearch])

  useEffect(() => {
    handleSearch(value)
  }, [value, handleSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        handleSearch(value)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const isSelected = suggestions.length === 0 && value.length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 1 && handleSearch(value)}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-12 pr-10 py-4 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
            isSelected ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {isSelected ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden autocomplete-list"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                highlightedIndex === index
                  ? 'bg-green-50 text-green-900'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <span>{suggestion}</span>
              {highlightedIndex === index && (
                <span className="text-xs text-green-600">Press Enter</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
