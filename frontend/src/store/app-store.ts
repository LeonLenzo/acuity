import { create } from 'zustand'

interface ViewRange {
  start: number
  end: number
}

interface AppState {
  selectedAssemblyId: string | null
  selectedContigId: string | null
  selectedFeatureId: string | null
  viewRange: ViewRange | null

  selectAssembly: (id: string | null) => void
  selectContig: (id: string | null) => void
  selectFeature: (id: string | null) => void
  setViewRange: (range: ViewRange) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedAssemblyId: null,
  selectedContigId: null,
  selectedFeatureId: null,
  viewRange: null,

  selectAssembly: (id) => set({ selectedAssemblyId: id, selectedContigId: null, selectedFeatureId: null, viewRange: null }),
  selectContig: (id) => set({ selectedContigId: id, selectedFeatureId: null, viewRange: null }),
  selectFeature: (id) => set({ selectedFeatureId: id }),
  setViewRange: (range) => set({ viewRange: range }),
}))
