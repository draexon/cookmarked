import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchService } from '@/services/searchService'

const RECENT_KEY = 'cookmarked_recent_searches'

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || [] } catch { return [] }
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(getRecent)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const results = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  const addRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_KEY)
  }

  return { query, setQuery, debouncedQuery, results, recentSearches, addRecentSearch, clearRecentSearches }
}
