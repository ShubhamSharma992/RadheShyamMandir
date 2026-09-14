'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitContact, type ContactState } from '@/app/contact/actions'

const initial: ContactState = { status: 'idle' }

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Sending…' : 'Send message'}
    </button>
  )
}

export function ContactForm() {
  const [state, action] = useFormState(submitContact, initial)

  if (state.status === 'sent') {
    return (
      <div className="border-l-2 border-tulsi bg-tulsi-tint px-6 py-5">
        <p className="font-display text-step-1">Message sent</p>
        <p className="mt-1 text-step--1 text-bark-soft">
          Someone from the committee will get back to you. For anything urgent, please call instead.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="name" className="field-label">
          Your name
        </label>
        <input id="name" name="name" required className="field" autoComplete="name" />
        {state.errors?.name && <span className="field-error">{state.errors.name[0]}</span>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="field-label">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" inputMode="tel" />
          {state.errors?.phone && <span className="field-error">{state.errors.phone[0]}</span>}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email <span className="text-bark-muted">(optional)</span>
          </label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" />
          {state.errors?.email && <span className="field-error">{state.errors.email[0]}</span>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="field-label">
          Subject
        </label>
        <input id="subject" name="subject" className="field" />
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Message
        </label>
        <textarea id="message" name="message" rows={6} required className="field resize-y" />
        {state.errors?.message && <span className="field-error">{state.errors.message[0]}</span>}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="website">Leave this blank</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && <p className="field-error">{state.message}</p>}

      <Submit />
    </form>
  )
}
