import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reelService } from '@/services/reelService'

export function useFavorites() {
  return useQuery({
    queryKey: ['reels', 'favorites'],
    queryFn: reelService.getFavorites,
  })
}

export function useSaveReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reelService.save,
    onSuccess: (reel) => {
      qc.invalidateQueries({ queryKey: ['collections'] })
      const collectionId = reel?.collection_id
      if (collectionId) {
        qc.invalidateQueries({ queryKey: ['collection', String(collectionId)] })
      }
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useRandomReel() {
  return useMutation({
    mutationFn: reelService.getRandom,
  })
}

export function useDeleteReel(collectionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reelService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection', String(collectionId)] })
      qc.invalidateQueries({ queryKey: ['reels', 'favorites'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reelService.toggleFavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reels', 'favorites'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
