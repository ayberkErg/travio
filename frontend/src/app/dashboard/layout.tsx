import Sidebar from '@/components/layout/Sidebar'
import AppHeader from '@/components/layout/AppHeader'
import PlusModal from '@/components/ui/PlusModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <PlusModal />
    </div>
  )
}
