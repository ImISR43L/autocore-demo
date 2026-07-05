import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// As importações do Supabase foram removidas para o ambiente de demonstração
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ClassroomView from "./pages/ClassroomView";
import CreateProblem from "./pages/CreateProblem";
import EditProblem from "./pages/EditProblem";
import { SettingsModal } from "./components/SettingsModal";

// Importe o componente principal da sua nova feature
import { MoleculeWorkspace } from "./features/molecule-env";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  // Estado simplificado para verificar a sessão localmente
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Substituímos a chamada do Supabase pela verificação no sessionStorage
    const user = sessionStorage.getItem("demo_user");
    setIsAuthenticated(!!user);
  }, []);

  // Mantemos o mesmo comportamento original de não renderizar nada enquanto carrega
  if (isAuthenticated === null) return null;

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors expand={true} />
      <SettingsModal />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* Adicione a rota de desenvolvimento para as moléculas */}
        <Route path="/molecules" element={<MoleculeWorkspace />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/class/:id"
          element={
            <PrivateRoute>
              <ClassroomView />
            </PrivateRoute>
          }
        />
        <Route
          path="/class/:classroomId/create-problem"
          element={
            <PrivateRoute>
              <CreateProblem />
            </PrivateRoute>
          }
        />
        <Route
          path="/class/:classroomId/problem/:id/edit"
          element={
            <PrivateRoute>
              <EditProblem />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
