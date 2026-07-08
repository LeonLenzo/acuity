'use client'

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AssemblyOverview } from '@/components/assembly/assembly-overview'
import { ContigViewer } from '@/components/viewer/contig-viewer'
import { useAppStore } from '@/store/app-store'

export default function AppPage() {
  const { selectedAssemblyId, selectedContigId } = useAppStore()

  if (!selectedAssemblyId) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="flex h-10 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Select an assembly from the sidebar
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <header className="flex h-10 items-center gap-2 border-b px-4 shrink-0">
        <SidebarTrigger className="-ml-1" />
      </header>

      {selectedContigId ? (
        <ResizablePanelGroup orientation="vertical" className="flex-1 min-h-0">
          <ResizablePanel defaultSize={50} minSize={25}>
            <ContigViewer />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <AssemblyOverview />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <AssemblyOverview />
        </div>
      )}
    </div>
  )
}
