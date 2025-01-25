import { Images } from "@/app/components/images"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar side="right" variant="floating">
      <SidebarTrigger className="absolute left-[-40px] bottom-4" />
      <SidebarHeader />
      <SidebarContent>
        <Images />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
