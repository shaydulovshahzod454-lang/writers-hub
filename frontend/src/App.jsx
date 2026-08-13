import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ChapterEditor from './pages/ChapterEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/chapters/:id" element={<ChapterEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;