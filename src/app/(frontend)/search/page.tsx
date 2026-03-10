import { SearchInput } from '@/components/search-input'

export const metadata = {
  title: 'Search — Tree Identity',
  description: 'Search across all seeds',
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Search</h1>
      <p className="mb-6 text-sm text-slate-400">Find articles, notes, and more</p>
      <SearchInput />
    </div>
  )
}
