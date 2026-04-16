import { Menu } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ConnectionPanel } from '@/components/connection/ConnectionPanel';

const Index = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <ChatArea />
      </main>

      <ConnectionPanel />
    </div>
  );
};

export default Index;
