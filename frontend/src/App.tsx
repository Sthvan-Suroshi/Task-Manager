import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { ProjectSidebar } from './components/ProjectSidebar';
import { KanbanBoard } from './components/KanbanBoard';

function App() {
  return (
    <Router>
      <SidebarProvider>
        <ProjectSidebar />
        <SidebarInset>
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Navigate to="/projects/default" replace />} />
              <Route path="/projects/:projectId" element={<KanbanBoard />} />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
}

export default App;
