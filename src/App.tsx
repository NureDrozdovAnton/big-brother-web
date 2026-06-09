import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { OperatorLayout } from "@/pages/operator/OperatorLayout";
import { CamerasListPage } from "@/pages/operator/CamerasListPage";
import { CameraViewPage } from "@/pages/operator/CameraViewPage";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CamerasPage } from "@/pages/admin/CamerasPage";
import { OperatorsPage } from "@/pages/admin/OperatorsPage";
import { LogsPage } from "@/pages/admin/LogsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { RecordingsPage } from "@/pages/admin/RecordingsPage";
import { Spinner } from "@/components/ui/Spinner";

const qc = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootRedirect() {
    const { user, loading } = useAuth();
    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    if (!user) return <Navigate to="/login" replace />;
    return (
        <Navigate to={user.role === "Admin" ? "/admin" : "/operator"} replace />
    );
}

export default function App() {
    return (
        <QueryClientProvider client={qc}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<LoginPage />} />

                        <Route
                            path="/operator"
                            element={
                                <ProtectedRoute role="Operator">
                                    <OperatorLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<CamerasListPage />} />
                            <Route
                                path="cameras/:id"
                                element={<CameraViewPage />}
                            />
                        </Route>

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute role="Admin">
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<DashboardPage />} />
                            <Route path="cameras" element={<CamerasPage />} />
                            <Route
                                path="operators"
                                element={<OperatorsPage />}
                            />
                            <Route path="logs" element={<LogsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route
                                path="cameras/:id/recordings"
                                element={<RecordingsPage />}
                            />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}
