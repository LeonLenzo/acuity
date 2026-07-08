'use client'

import { useState } from 'react'
import { ChevronRight, Dna } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { mockOrganisms } from '@/lib/mock-data'
import { useAppStore } from '@/store/app-store'

function IsolateTree({ isolate, isAssemblyActive, onSelectAssembly }: {
  isolate: typeof mockOrganisms[0]['isolates'][0]
  isAssemblyActive: (id: string) => boolean
  onSelectAssembly: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <SidebarMenuSubItem>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-sidebar-accent text-sidebar-foreground"
      >
        <ChevronRight
          className={`size-3 shrink-0 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        <span className="font-mono">{isolate.name}</span>
      </button>
      {open && (
        <SidebarMenuSub>
          {isolate.assemblies.map((assembly) => (
            <SidebarMenuSubItem key={assembly.id}>
              <SidebarMenuSubButton
                isActive={isAssemblyActive(assembly.id)}
                onClick={() => onSelectAssembly(assembly.id)}
                className="cursor-pointer"
              >
                <span className="font-mono text-xs">{assembly.name}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuSubItem>
  )
}

function OrganismTree({ organism, isAssemblyActive, onSelectAssembly }: {
  organism: typeof mockOrganisms[0]
  isAssemblyActive: (id: string) => boolean
  onSelectAssembly: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <SidebarMenuItem>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-sm hover:bg-sidebar-accent text-sidebar-foreground"
      >
        <ChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        <span className="italic">{organism.name}</span>
      </button>
      {open && (
        <SidebarMenuSub>
          {organism.isolates.map((isolate) => (
            <IsolateTree
              key={isolate.id}
              isolate={isolate}
              isAssemblyActive={isAssemblyActive}
              onSelectAssembly={onSelectAssembly}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { selectedAssemblyId, selectAssembly } = useAppStore()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Dna className="size-5 text-primary" />
          <span className="font-semibold tracking-tight">acuity</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organisms</SidebarGroupLabel>
          <SidebarMenu>
            {mockOrganisms.map((organism) => (
              <OrganismTree
                key={organism.id}
                organism={organism}
                isAssemblyActive={(id) => selectedAssemblyId === id}
                onSelectAssembly={selectAssembly}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
