// useCollections.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionService } from '@/services/collectionService'

export function useCollections(params) {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: () => collectionService.getAll(params),
  })
}

export function useCollection(id) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectionService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectionService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export function useToggleCollectionFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: collectionService.toggleFavorite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  })
}
