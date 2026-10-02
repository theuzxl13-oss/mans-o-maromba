import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import Home from '@/pages/public/Home';
import Login from '@/pages/auth/Login';

const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Students = lazy(() => import('@/pages/admin/students/Students'));
const StudentForm = lazy(() => import('@/pages/admin/students/StudentForm'));
const StudentProfile = lazy(() => import('@/pages/admin/students/StudentProfile'));
const Plans = lazy(() => import('@/pages/admin/Plans'));
const Payments = lazy(() => import('@/pages/admin/finance/Payments'));
const Finance = lazy(() => import('@/pages/admin/finance/Finance'));
const Checkins = lazy(() => import('@/pages/admin/Checkins'));
const AccessControl = lazy(() => import('@/pages/admin/access/AccessControl'));
const AccessCenter = lazy(() => import('@/pages/admin/access/AccessCenter'));
const Biometrics = lazy(() => import('@/pages/admin/access/Biometrics'));
const Wellhub = lazy(() => import('@/pages/admin/partners/Wellhub'));
const TotalPass = lazy(() => import('@/pages/admin/partners/TotalPass'));
const Employees = lazy(() => import('@/pages/admin/Employees'));
const Reports = lazy(() => import('@/pages/admin/Reports'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-7 animate-spin text-brand-500" />
    </div>
  );
}

// HashRouter: funciona em qualquer hospedagem estática (GitHub Pages, Netlify, etc.)
export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alunos" element={<Students />} />
            <Route path="alunos/novo" element={<StudentForm />} />
            <Route path="alunos/:id" element={<StudentProfile />} />
            <Route path="alunos/:id/editar" element={<StudentForm />} />
            <Route path="planos" element={<Plans />} />
            <Route path="mensalidades" element={<Payments />} />
            <Route path="checkins" element={<Checkins />} />
            <Route path="controle-acesso" element={<AccessControl />} />
            <Route path="catraca" element={<AccessCenter />} />
            <Route path="biometria" element={<Biometrics />} />
            <Route path="wellhub" element={<Wellhub />} />
            <Route path="totalpass" element={<TotalPass />} />
            <Route path="financeiro" element={<Finance />} />
            <Route path="funcionarios" element={<Employees />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
