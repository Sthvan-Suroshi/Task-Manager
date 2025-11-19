import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { useKanbanStore } from "./stores/kanbanStore";
import { ProjectSidebar } from "./components/ProjectSidebar";
import { KanbanBoard } from "./components/KanbanBoard";
import { Login } from "./components/Login";

function AppContent() {
  const { isLoggedIn, login } = useKanbanStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/projects/default" replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          isLoggedIn ? (
            <SidebarProvider>
              <ProjectSidebar />
              <SidebarInset>
                <div className="p-4">
                  <KanbanBoard />
                </div>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isLoggedIn ? "/projects/default" : "/login"} replace />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
