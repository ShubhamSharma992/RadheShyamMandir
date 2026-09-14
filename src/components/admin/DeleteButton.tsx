'use client'

import { useState } from 'react'

/**
 * Two-step delete. The confirmation replaces the button in place rather than
 * opening a dialog, so it works the same on a phone.
 */
export function DeleteButton({
  action,
  id,
  label = 'Delete',
  confirm,
}: {
  action: (formData: FormData) => void
  id: string
  label?: string
  confirm: string
}) {
  const [armed, setArmed] = useState(false)

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="text-bark-muted hover:text-sindoor">
        {label}
      </button>
    )
  }

  return (
    <span className="flex items-center gap-3">
      <span className="text-bark-soft">{confirm}</span>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="font-medium text-sindoor hover:text-sindoor-deep">
          Yes, delete
        </button>
      </form>
      <button type="button" onClick={() => setArmed(false)} className="text-bark-muted hover:text-bark">
        Keep
      </button>
    </span>
  )
}
