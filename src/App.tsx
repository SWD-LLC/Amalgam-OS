import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { BestieAIPage } from './pages/BestieAIPage';
import { CategoryArbitragePage } from './pages/CategoryArbitragePage';
import { ClipPipelinePage } from './pages/ClipPipelinePage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { DashboardPage } from './pages/DashboardPage';
import { GrowthSystemPage } from './pages/GrowthSystemPage';
import { RaidNetworkPage } from './pages/RaidNetworkPage';
import { SettingsPage } from './pages/SettingsPage';
import { StreamPipelinePage } from './pages/StreamPipelinePage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/studio" element={<CreatorStudioPage />} />
        <Route path="/stream-pipeline" element={<StreamPipelinePage />} />
        <Route path="/clip-pipeline" element={<ClipPipelinePage />} />
        <Route path="/growth-system" element={<GrowthSystemPage />} />
        <Route path="/category-arbitrage" element={<CategoryArbitragePage />} />
        <Route path="/raid-network" element={<RaidNetworkPage />} />
        <Route path="/bestie-ai" element={<BestieAIPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
