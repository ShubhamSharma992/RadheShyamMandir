'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchField({ initial = '', big = false }: { initial?: string; big?: boolean }) {
  const [value, setValue] = useState(initial)
  const router = useRouter()

  return (
    <div className={big ? 'w-full' : 'relative'}>
      <label htmlFor={big ? 'search-page' : 'search-header'} className="sr-only">
        Search the temple website
      </label>
      <input
        id={big ? 'search-page' : 'search-header'}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim().length > 1) {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`)
          }
        }}
        placeholder={big ? 'Search events, announcements, photos and videos' : 'Search'}
        className={
          big
            ? 'field h-14 text-step-1'
            : 'w-40 border-0 border-b border-bark/25 bg-transparent py-1.5 text-step--1 placeholder:text-bark-muted focus:border-sindoor focus:outline-none'
        }
      />
    </div>
  )
}
