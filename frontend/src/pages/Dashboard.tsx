import { AppShell, Button } from '@mantine/core';
import { useAuth } from '../providers/AuthProvider';

export default function Dashboard() {
  const { signOut, user } = useAuth();

  return (
    <AppShell
      padding="md"
      navbar={{ width: 300, breakpoint: 'sm' }}
      header={{ height: 60 }}
      className="bg-steam-dark"
    >
      <AppShell.Navbar className="bg-steam-light p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-steam-blue flex items-center justify-center">
            😊
          </div>
          <Button variant="subtle" className="w-12 h-12 p-0 rounded-full">
            +
          </Button>
        </div>
      </AppShell.Navbar>

      <AppShell.Header className="bg-steam-dark flex justify-between items-center p-4">
        <div className="text-steam-blue font-bold">Secure Collaboration</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <Button variant="subtle" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <div className="h-full bg-steam-light rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Welcome to Your Workspace</h2>
          <p className="text-gray-400">
            Select a server from the left sidebar or create a new one to get started.
          </p>
        </div>
      </AppShell.Main>
    </AppShell>
  );
} 