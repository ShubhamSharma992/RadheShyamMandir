'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveAnnouncement, type FormState } from '@/app/admin/actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : 'Post announcement'}
    </button>
  )
}

export function AnnouncementForm() {
  const [state, action] = useFormState<FormState, FormData>(saveAnnouncement, {})

  return (
    <form action={action} className="space-y-5">
      {state.message && (
        <p
          role="alert"
          className={
            state.ok
              ? 'border-l-2 border-tulsi bg-tulsi-tint px-4 py-3 text-step--1'
              : 'border-l-2 border-sindoor bg-sindoor-tint px-4 py-3 text-step--1 text-sindoor-deep'
          }
        >
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="a-title" className="field-label">Title</label>
        <input id="a-title" name="title" required className="field" />
        {state.errors?.title && <span className="field-error">{state.errors.title[0]}</span>}
      </div>

      <div>
        <label htmlFor="a-titleHi" className="field-label">Title in Hindi <span className="text-bark-muted">(optional)</span></label>
        <input id="a-titleHi" name="titleHi" lang="hi" className="field" />
      </div>

      <div>
        <label htmlFor="a-body" className="field-label">Announcement</label>
        <textarea id="a-body" name="body" rows={5} required className="field resize-y" />
        {state.errors?.body && <span className="field-error">{state.errors.body[0]}</span>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="a-startsAt" className="field-label">Show from</label>
          <input id="a-startsAt" name="startsAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="field" />
        </div>
        <div>
          <label htmlFor="a-expiresAt" className="field-label">Stop showing on</label>
          <input id="a-expiresAt" name="expiresAt" type="date" className="field" />
          <span className="mt-1 block text-step--1 text-bark-muted">
            Leave blank to keep it up. Past this date it drops off the home page on its own.
          </span>
          {state.errors?.expiresAt && <span className="field-error">{state.errors.expiresAt[0]}</span>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="a-priority" className="field-label">Priority</label>
          <select id="a-priority" name="priority" className="field">
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label htmlFor="a-status" className="field-label">Status</label>
          <select id="a-status" name="status" defaultValue="PUBLISHED" className="field">
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      <Submit />
    </form>
  )
}
