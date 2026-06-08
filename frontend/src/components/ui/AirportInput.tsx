'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { searchAirports, type Airport } from '@/lib/airports'

interface AirportInputProps {
  value: string
  onChange: (value: string, iata: string) => void
  placeholder?: string
  label?: string
  /** cityOnly=true → seçimde sadece şehir adı gösterilir, IATA kodu gösterilmez */
  cityOnly?: boolean
  required?: boolean
}

export default function AirportInput({ value, onChange, placeholder, label, cityOnly = false, required }: AirportInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const handleQuery = useCallback((q: string) => {
    setQuery(q)
    const results = searchAirports(q)
    setSuggestions(results)
    setOpen(results.length > 0)
    setHighlighted(-1)
    // düz metin yazıldığında iata'yı boş geç, seçimde dolar
    onChange(q, '')
  }, [onChange])

  function select(airport: Airport) {
    const display = cityOnly ? airport.city : `${airport.city} (${airport.iata})`
    setQuery(display)
    setSuggestions([])
    setOpen(false)
    onChange(display, airport.iata)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      select(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={query}
        required={required}
        onChange={e => handleQuery(e.target.value)}
        onFocus={() => {
          if (query) {
            const s = searchAirports(query)
            if (s.length) { setSuggestions(s); setOpen(true) }
          }
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />

      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden max-h-72 overflow-y-auto"
        >
          {suggestions.map((airport, i) => (
            <li
              key={airport.iata}
              onMouseDown={() => select(airport)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i === highlighted ? 'bg-amber/10' : 'hover:bg-stone-50'
              } ${i > 0 ? 'border-t border-stone-100' : ''}`}
            >
              <span className="text-xl shrink-0">{airport.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{airport.city}</p>
                <p className="text-stone-400 text-xs">{airport.country}</p>
              </div>
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg shrink-0">
                {airport.iata}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
