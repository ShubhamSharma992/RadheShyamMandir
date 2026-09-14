'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from '@/app/admin/login/actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState<LoginState, FormData>(login, {})

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? '/admin'} />

      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>

      {state.error && (
        <p role="alert" className="border-l-2 border-sindoor bg-sindoor-tint px-4 py-3 text-step--1 text-sindoor-deep">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  )
}
