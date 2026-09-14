'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { saveVideo, type FormState } from '@/app/admin/actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Adding…' : 'Add video'}
    </button>
  )
}

export function VideoForm({ events }: { events: { id: string; title: string }[] }) {
  const [state, action] = useFormState<FormState, FormData>(saveVideo, {})
  const [source, setSource] = useState<'YOUTUBE' | 'UPLOAD'>('YOUTUBE')

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
        <label htmlFor="v-title" className="field-label">Title</label>
        <input id="v-title" name="title" required className="field" />
        {state.errors?.title && <span className="field-error">{state.errors.title[0]}</span>}
      </div>

      <div>
        <label htmlFor="v-source" className="field-label">Where is the video</label>
        <select
          id="v-source"
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value as 'YOUTUBE' | 'UPLOAD')}
          className="field"
        >
          <option value="YOUTUBE">On YouTube</option>
          <option value="UPLOAD">Uploaded to this website</option>
        </select>
      </div>

      {source === 'YOUTUBE' ? (
        <div>
          <label htmlFor="v-youtube" className="field-label">YouTube link</label>
          <input id="v-youtube" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=…" className="field" />
          {state.errors?.youtubeUrl && <span className="field-error">{state.errors.youtubeUrl[0]}</span>}
        </div>
      ) : (
        <div>
          <label htmlFor="v-file" className="field-label">Video address</label>
          <input id="v-file" name="fileUrl" placeholder="Paste the address of an uploaded video" className="field" />
          <span className="mt-1 block text-step--1 text-bark-muted">
            Upload the file in the Photos and videos tab first, then paste its address here.
          </span>
        </div>
      )}

      <div>
        <label htmlFor="v-description" className="field-label">Description</label>
        <textarea id="v-description" name="description" rows={3} className="field resize-y" />
      </div>

      <div>
        <label htmlFor="v-event" className="field-label">Part of an event</label>
        <select id="v-event" name="eventId" className="field">
          <option value="">Not linked to an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 text-step--1">
        <input type="checkbox" name="isFeatured" className="h-4 w-4 accent-sindoor" />
        Show this first in the video section
      </label>

      <Submit />
    </form>
  )
}
