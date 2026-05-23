import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reelService } from '@/services/reelService'

function updateReelCaches(qc, updatedReel) {
  qc.setQueriesData({ queryKey: ['reels'] }, (current) => {
    if (!Array.isArray(current)) return current
    return current
      .map((reel) => reel.id === updatedReel.id ? updatedReel : reel)
      .filter((reel) => reel.is_favorite)
  })
  qc.setQueriesData({ queryKey: ['collection'] }, (current) => {
    if (!current?.reels) return current
    return {
      ...current,
      reels: current.reels.map((reel) => reel.id === updatedReel.id ? updatedReel : reel),
    }
  })
  qc.setQueriesData({ queryKey: ['search'] }, (current) => {
    if (!current?.reels) return current
    return {
      ...current,
      reels: current.reels.map((reel) => reel.id === updatedReel.id ? updatedReel : reel),
    }
  })
}

function invalidateReelQueries(qc) {
  qc.invalidateQueries({ queryKey: ['reels', 'favorites'] })
  qc.invalidateQueries({ queryKey: ['collection'] })
  qc.invalidateQueries({ queryKey: ['search'] })
  qc.invalidateQueries({ queryKey: ['stats'] })
}

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
    onSuccess: (updatedReel) => {
      updateReelCaches(qc, updatedReel)
      invalidateReelQueries(qc)
    },
  })
}

export function useToggleMade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reelService.toggleMade,
    onSuccess: (updatedReel) => {
      updateReelCaches(qc, updatedReel)
      invalidateReelQueries(qc)
    },
  })
}
