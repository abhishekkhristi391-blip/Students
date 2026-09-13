/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileFrame from './components/MobileFrame';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import PracticeLists from './pages/practice/PracticeLists';
import MCQEngine from './pages/practice/MCQEngine';
import TestEngine from './pages/test/TestEngine';
import TestResult from './pages/test/TestResult';
import PerformanceAnalytics from './pages/analytics/PerformanceAnalytics';
import WeakTopics from './pages/practice/WeakTopics';
import Bookmarks from './pages/practice/Bookmarks';
import DailyChallenge from './pages/daily/DailyChallenge';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Profile from './pages/profile/Profile';
import Chat from './pages/chat/Chat';
import Notifications from './pages/notifications/Notifications';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminMCQ from './pages/admin/AdminMCQ';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Admin Panel (Web Target) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="mcq" element={<AdminMCQ />} />
        <Route path="subjects" element={<div className="p-8 font-bold">Subject Management Coming Soon</div>} />
        <Route path="settings" element={<div className="p-8 font-bold">Settings Coming Soon</div>} />
      </Route>

      {/* Student App (Mobile Frame Target) */}
      <Route element={<MobileFrame />}>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Phase 4: Analytics, Bookmarks, Weak Topics */}
        <Route path="/analytics" element={<ProtectedRoute><PerformanceAnalytics /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/practice/weak-topics" element={<ProtectedRoute><WeakTopics /></ProtectedRoute>} />

        {/* Practice Module (Phase 2) */}
        <Route path="/practice" element={<ProtectedRoute><PracticeLists /></ProtectedRoute>} />
        <Route path="/practice/subject/:subjectId" element={<ProtectedRoute><PracticeLists /></ProtectedRoute>} />
        <Route path="/practice/chapter/:chapterId" element={<ProtectedRoute><PracticeLists /></ProtectedRoute>} />
        <Route path="/practice/topic/:topicId/mcq" element={<ProtectedRoute><MCQEngine /></ProtectedRoute>} />

        {/* Test Module (Phase 3) */}
        <Route path="/test/active" element={<ProtectedRoute><TestEngine /></ProtectedRoute>} />
        <Route path="/test/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />

        {/* Phase 5: Daily Challenge, Leaderboard, Profile */}
        <Route path="/daily" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Phase 6 & 7: Chat, Notifications */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
