'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveTempleInfo, type FormState } from '@/app/admin/actions'

type Values = Record<string, string | number | null | undefined>

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  )
}

function Field({
  name, label, hint, value, type = 'text', rows, errors,
}: {
  name: string; label: string; hint?: string; value?: string | number | null
  type?: string; rows?: number; errors?: string[]
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} defaultValue={value ?? ''} className="field resize-y" />
      ) : (
        <input id={name} name={name} type={type} defaultValue={value ?? ''} className="field" />
      )}
      {hint && <span className="mt-1 block text-step--1 text-bark-muted">{hint}</span>}
      {errors?.length && <span className="field-error">{errors[0]}</span>}
    </div>
  )
}

export function TempleInfoForm({ temple }: { temple: Values }) {
  const [state, action] = useFormState<FormState, FormData>(saveTempleInfo, {})
  const e = state.errors

  return (
    <form action={action} className="max-w-3xl space-y-12">
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
        <legend className="mb-4 font-display text-step-2">Name and welcome</legend>
        <Field name="name" label="Temple name" value={temple.name as string} errors={e?.name} />
        <Field name="nameHi" label="Name in Hindi" value={temple.nameHi as string} hint="Shown above the English name in the header and hero." />
        <Field name="tagline" label="One line about the temple" value={temple.tagline as string} />
        <Field name="welcomeHeading" label="Welcome heading" value={temple.welcomeHeading as string} />
        <Field name="welcomeBody" label="Welcome text" rows={5} value={temple.welcomeBody as string} hint="Appears near the top of the home page. Leave a blank line between paragraphs." />
        <Field name="heroImageUrl" label="Hero photograph address" value={temple.heroImageUrl as string} hint="Paste the address of an uploaded photograph. A wide landscape photo works best." />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 font-display text-step-2">About the temple</legend>
        <p className="text-step--1 text-bark-muted">
          Only sections you fill in appear on the About page. Leave anything blank if the committee is not certain of it.
        </p>
        <Field name="introduction" label="Introduction" rows={5} value={temple.introduction as string} />
        <Field name="history" label="History" rows={8} value={temple.history as string} />
        <Field name="significance" label="Religious significance" rows={5} value={temple.significance as string} />
        <Field name="community" label="The village and the temple" rows={5} value={temple.community as string} />
        <Field name="traditions" label="Traditions and festivals" rows={5} value={temple.traditions as string} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 font-display text-step-2">Where the temple is</legend>
        <Field name="addressLine" label="Address" value={temple.addressLine as string} errors={e?.addressLine} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="district" label="District" value={temple.district as string} />
          <Field name="state" label="State" value={temple.state as string} />
          <Field name="pincode" label="PIN code" value={temple.pincode as string} errors={e?.pincode} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="latitude" label="Latitude" value={temple.latitude as number} hint="Optional, but it makes the map exact." errors={e?.latitude} />
          <Field name="longitude" label="Longitude" value={temple.longitude as number} errors={e?.longitude} />
        </div>
        <Field name="mapsPlaceUrl" label="Google Maps link" value={temple.mapsPlaceUrl as string} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 font-display text-step-2">Getting in touch</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="phone" label="Phone" type="tel" value={temple.phone as string} errors={e?.phone} />
          <Field name="whatsapp" label="WhatsApp number" value={temple.whatsapp as string} />
        </div>
        <Field name="email" label="Email" type="email" value={temple.email as string} errors={e?.email} />
        <Field name="facebookUrl" label="Facebook page" type="url" value={temple.facebookUrl as string} />
        <Field name="instagramUrl" label="Instagram" type="url" value={temple.instagramUrl as string} />
        <Field name="youtubeUrl" label="YouTube channel" type="url" value={temple.youtubeUrl as string} />
      </fieldset>

      <Submit />
    </form>
  )
}
