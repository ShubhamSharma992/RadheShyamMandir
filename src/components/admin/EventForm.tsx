'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { saveEvent, type FormState } from '@/app/admin/actions'
import { Uploader } from './Uploader'
import { slugify } from '@/lib/utils'

type Option = { id: string; name: string }
type Asset = { id: string; url: string; thumbnailUrl?: string | null; kind: string }

type EventValues = {
  id?: string
  title?: string
  titleHi?: string | null
  slug?: string
  summary?: string | null
  description?: string
  startDate?: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  allDay?: boolean
  location?: string
  organizer?: string | null
  contactName?: string | null
  contactPhone?: string | null
  registrationUrl?: string | null
  registrationNote?: string | null
  categoryId?: string | null
  coverImageId?: string | null
  isFeatured?: boolean
  status?: string
}

function Submit({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
    </button>
  )
}

function Err({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <span className="field-error">{errors[0]}</span>
}

export function EventForm({
  event,
  categories,
  library,
}: {
  event?: EventValues
  categories: Option[]
  library: Asset[]
}) {
  const [state, action] = useFormState<FormState, FormData>(saveEvent, {})
  const [allDay, setAllDay] = useState(event?.allDay ?? false)
  const [title, setTitle] = useState(event?.title ?? '')
  const [slug, setSlug] = useState(event?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(event?.slug))
  const [cover, setCover] = useState(event?.coverImageId ?? '')
  const [assets, setAssets] = useState<Asset[]>(library)

  const images = assets.filter((a) => a.kind === 'IMAGE')

  return (
    <form action={action} className="max-w-3xl space-y-10">
      {event?.id && <input type="hidden" name="id" value={event.id} />}

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

      <fieldset className="space-y-5">
        <legend className="mb-4 font-display text-step-2">What is happening</legend>

        <div>
          <label htmlFor="title" className="field-label">Event title</label>
          <input
            id="title" name="title" required className="field" value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
          />
          <Err errors={state.errors?.title} />
        </div>

        <div>
          <label htmlFor="titleHi" className="field-label">Title in Hindi <span className="text-bark-muted">(optional)</span></label>
          <input id="titleHi" name="titleHi" lang="hi" defaultValue={event?.titleHi ?? ''} className="field" />
        </div>

        <div>
          <label htmlFor="slug" className="field-label">Web address</label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-step--1 text-bark-muted">/events/</span>
            <input
              id="slug" name="slug" className="field" value={slug}
              onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }}
            />
          </div>
          <Err errors={state.errors?.slug} />
        </div>

        <div>
          <label htmlFor="summary" className="field-label">One-line summary</label>
          <input id="summary" name="summary" maxLength={280} defaultValue={event?.summary ?? ''} className="field" />
          <span className="mt-1 block text-step--1 text-bark-muted">Shown on event cards and in search results.</span>
          <Err errors={state.errors?.summary} />
        </div>

        <div>
          <label htmlFor="description" className="field-label">Full description</label>
          <textarea id="description" name="description" rows={8} required defaultValue={event?.description ?? ''} className="field resize-y" />
          <span className="mt-1 block text-step--1 text-bark-muted">Leave a blank line between paragraphs.</span>
          <Err errors={state.errors?.description} />
        </div>

        <div>
          <label htmlFor="categoryId" className="field-label">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={event?.categoryId ?? ''} className="field">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 font-display text-step-2">When and where</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="field-label">Start date</label>
            <input id="startDate" name="startDate" type="date" required defaultValue={event?.startDate ?? ''} className="field" />
            <Err errors={state.errors?.startDate} />
          </div>
          <div>
            <label htmlFor="endDate" className="field-label">End date <span className="text-bark-muted">(if it runs more than a day)</span></label>
            <input id="endDate" name="endDate" type="date" defaultValue={event?.endDate ?? ''} className="field" />
            <Err errors={state.errors?.endDate} />
          </div>
        </div>

        <label className="flex items-center gap-3 text-step--1">
          <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-sindoor" />
          This runs all day
        </label>

        {!allDay && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="field-label">Start time</label>
              <input id="startTime" name="startTime" type="time" defaultValue={event?.startTime ?? ''} className="field" />
              <Err errors={state.errors?.startTime} />
            </div>
            <div>
              <label htmlFor="endTime" className="field-label">End time</label>
              <input id="endTime" name="endTime" type="time" defaultValue={event?.endTime ?? ''} className="field" />
              <Err errors={state.errors?.endTime} />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="location" className="field-label">Place</label>
          <input id="location" name="location" required defaultValue={event?.location ?? 'Village Temple, Ratouli'} className="field" />
          <Err errors={state.errors?.location} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="organizer" className="field-label">Organised by</label>
            <input id="organizer" name="organizer" defaultValue={event?.organizer ?? ''} className="field" />
          </div>
          <div>
            <label htmlFor="contactName" className="field-label">Who to ask</label>
            <input id="contactName" name="contactName" defaultValue={event?.contactName ?? ''} className="field" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contactPhone" className="field-label">Contact number</label>
            <input id="contactPhone" name="contactPhone" type="tel" inputMode="tel" defaultValue={event?.contactPhone ?? ''} className="field" />
            <Err errors={state.errors?.contactPhone} />
          </div>
          <div>
            <label htmlFor="registrationUrl" className="field-label">Registration link</label>
            <input id="registrationUrl" name="registrationUrl" type="url" defaultValue={event?.registrationUrl ?? ''} className="field" />
            <Err errors={state.errors?.registrationUrl} />
          </div>
        </div>

        <div>
          <label htmlFor="registrationNote" className="field-label">Note about joining in</label>
          <input id="registrationNote" name="registrationNote" defaultValue={event?.registrationNote ?? ''} className="field" />
          <span className="mt-1 block text-step--1 text-bark-muted">For example: bring your own thali, or call to register for bhandara seva.</span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-display text-step-2">Photographs</legend>

        <Uploader
          eventId={event?.id}
          onUploaded={(uploaded) => setAssets((prev) => [...(uploaded as Asset[]), ...prev])}
        />

        {images.length > 0 && (
          <>
            <p className="mt-8 field-label">Cover photograph</p>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <li>
                <button
                  type="button"
                  onClick={() => setCover('')}
                  className={`flex aspect-square w-full items-center justify-center border-2 text-step--1 ${cover === '' ? 'border-sindoor' : 'border-bark/20'}`}
                >
                  None
                </button>
              </li>
              {images.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => setCover(asset.id)}
                    className={`block aspect-square w-full overflow-hidden border-2 ${cover === asset.id ? 'border-sindoor' : 'border-transparent'}`}
                  >
                    <Image src={asset.thumbnailUrl ?? asset.url} alt="" width={200} height={200} className="h-full w-full object-cover" />
                    <span className="sr-only">Use as cover</span>
                  </button>
                  <input type="hidden" name="mediaIds" value={asset.id} />
                </li>
              ))}
            </ul>
          </>
        )}
        <input type="hidden" name="coverImageId" value={cover} />
      </fieldset>

      <fieldset className="space-y-5 border-t border-bark/15 pt-8">
        <legend className="sr-only">Publishing</legend>

        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={event?.status ?? 'DRAFT'} className="field max-w-[14rem]">
            <option value="DRAFT">Draft — only the committee sees it</option>
            <option value="PUBLISHED">Published — live on the website</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <label className="flex items-start gap-3 text-step--1">
          <input type="checkbox" name="isFeatured" defaultChecked={event?.isFeatured} className="mt-1 h-4 w-4 accent-sindoor" />
          <span>
            Feature this on the home page
            <span className="block text-bark-muted">Only one event can be featured; this replaces any current one.</span>
          </span>
        </label>

        <Submit isNew={!event?.id} />
      </fieldset>
    </form>
  )
}
