import { SearchInput } from '@/components/search-input'

export const metadata = {
  title: 'Search — Tree Identity',
  description: 'Search across all seeds',
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>
      <SearchInput />
    </div>
  )
}
