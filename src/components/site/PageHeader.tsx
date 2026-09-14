export function PageHeader({ title, titleHi, intro }: { title: string; titleHi?: string; intro?: string }) {
  return (
    <header className="border-b border-bark/10 bg-parchment">
      <div className="shell py-14 sm:py-20">
        {titleHi && (
          <p lang="hi" className="font-display text-step-2 text-sindoor">
            {titleHi}
          </p>
        )}
        <h1 className="text-step-4">{title}</h1>
        {intro && <p className="mt-4 max-w-prose text-step-1 text-bark-soft">{intro}</p>}
      </div>
    </header>
  )
}
