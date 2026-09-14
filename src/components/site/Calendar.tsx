'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatTimeRange } from '@/lib/utils'

export type CalendarEvent = {
  id: string
  title: string
  slug: string
  startDate: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  allDay?: boolean
  location: string
  category?: { name: string; color: string } | null
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parse(value: string) {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Month grid on tablet and up; an agenda list on phones, because a 7-column
 * grid on a 360px screen gives every day about 45px and nobody can read it.
 */
export function Calendar({
  events,
  initialMonth,
  compact = false,
}: {
  events: CalendarEvent[]
  initialMonth?: string
  compact?: boolean
}) {
  const today = new Date()
  const start = initialMonth ? parse(`${initialMonth}-01`) : today
  const [cursor, setCursor] = useState(new Date(start.getFullYear(), start.getMonth(), 1))
  const [selected, setSelected] = useState<string | null>(key(today))

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const from = parse(event.startDate)
      const to = event.endDate ? parse(event.endDate) : from
      for (const d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const k = key(d)
        map.set(k, [...(map.get(k) ?? []), event])
      }
    }
    return map
  }, [events])

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const lead = (first.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const out: (Date | null)[] = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [cursor])

  const monthEvents = useMemo(
    () =>
      events
        .filter((e) => {
          const d = parse(e.startDate)
          return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, cursor],
  )

  const shift = (delta: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
  const selectedEvents = selected ? (byDay.get(selected) ?? []) : []

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-display text-step-2">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <IconButton label="Previous month" onClick={() => shift(-1)} d="M15 5l-7 7 7 7" />
          <button
            type="button"
            onClick={() => {
              setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              setSelected(key(today))
            }}
            className="px-3 py-2 text-step--1 text-bark-soft hover:text-sindoor"
          >
            Today
          </button>
          <IconButton label="Next month" onClick={() => shift(1)} d="M9 5l7 7-7 7" />
        </div>
      </div>

      {/* Grid: tablet and up */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 border-b border-bark/15 pb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-step--1 text-bark-muted">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={`pad-${i}`} className="border-b border-r border-bark/10" />
            const k = key(date)
            const dayEvents = byDay.get(k) ?? []
            const isToday = k === key(today)
            const isSelected = k === selected

            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                aria-pressed={isSelected}
                className={[
                  'flex min-h-[5.5rem] flex-col gap-1 border-b border-r border-bark/10 p-2 text-left transition-colors',
                  isSelected ? 'bg-brass-tint' : 'hover:bg-bark/[0.03]',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-7 w-7 items-center justify-center text-step--1 tabular-nums',
                    isToday ? 'rounded-full bg-sindoor text-whitewash' : 'text-bark-soft',
                  ].join(' ')}
                >
                  {date.getDate()}
                </span>

                {!compact &&
                  dayEvents.slice(0, 2).map((event) => (
                    <span key={event.id} className="flex items-start gap-1.5 text-[0.7rem] leading-tight text-bark">
                      <span
                        className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: event.category?.color ?? '#B1332E' }}
                      />
                      <span className="line-clamp-2">{event.title}</span>
                    </span>
                  ))}

                {compact && dayEvents.length > 0 && (
                  <span className="flex gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: event.category?.color ?? '#B1332E' }}
                      />
                    ))}
                  </span>
                )}

                {dayEvents.length > 2 && !compact && (
                  <span className="text-[0.68rem] text-bark-muted">+{dayEvents.length - 2} more</span>
                )}
              </button>
            )
          })}
        </div>

        {selectedEvents.length > 0 && (
          <ul className="mt-6 divide-y divide-bark/10 border-t border-bark/15">
            {selectedEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>

      {/* Agenda: phones */}
      <div className="sm:hidden">
        {monthEvents.length === 0 ? (
          <p className="border border-dashed border-bark/20 px-4 py-10 text-center text-step--1 text-bark-muted">
            Nothing scheduled this month. Try the next one.
          </p>
        ) : (
          <ul className="divide-y divide-bark/10 border-y border-bark/15">
            {monthEvents.map((event) => (
              <EventRow key={event.id} event={event} showDate />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EventRow({ event, showDate = false }: { event: CalendarEvent; showDate?: boolean }) {
  const date = parse(event.startDate)
  const time = event.allDay ? 'All day' : formatTimeRange(event.startTime, event.endTime)

  return (
    <li>
      <Link href={`/events/${event.slug}`} className="flex gap-4 py-4 hover:text-sindoor">
        {showDate && (
          <span className="w-12 shrink-0 text-center">
            <span className="block font-display text-step-2 leading-none tabular-nums">{date.getDate()}</span>
            <span className="block text-[0.7rem] text-bark-muted">{WEEKDAYS[(date.getDay() + 6) % 7]}</span>
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: event.category?.color ?? '#B1332E' }}
            />
            <span className="font-display text-step-1">{event.title}</span>
          </span>
          <span className="mt-1 block text-step--1 text-bark-muted">
            {[time, event.location].filter(Boolean).join(' · ')}
          </span>
        </span>
      </Link>
    </li>
  )
}

function IconButton({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center text-bark-soft hover:text-sindoor"
    >
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d={d} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
