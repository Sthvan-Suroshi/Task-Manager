import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useKanbanStore } from "./stores/kanbanStore";
import { ProjectPage } from "./components/ProjectPage";
import { Login } from "./components/Login";

function AppContent() {
  const { isLoggedIn, login, loadProjects } = useKanbanStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      loadProjects().then((projects) => {
        if (projects.length > 0) {
          navigate(`/projects/${projects[0]._id}`, { replace: true });
        } else {
          navigate('/projects', { replace: true });
        }
      });
    }
  }, [isLoggedIn, loadProjects, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/projects" replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />
      <Route
        path="/projects"
        element={
          isLoggedIn ? (
            <ProjectPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          isLoggedIn ? (
            <ProjectPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isLoggedIn ? "/projects" : "/login"} replace />
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
