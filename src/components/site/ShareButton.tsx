'use client'

import { useState } from 'react'

/** Uses the native share sheet on phones, falls back to copying the link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // The person dismissed the sheet; fall through to copying.
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button type="button" onClick={share} className="btn-ghost w-full">
      {copied ? 'Link copied' : 'Share this event'}
    </button>
  )
}
