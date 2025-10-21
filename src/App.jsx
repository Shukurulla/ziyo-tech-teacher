// Updated src/App.jsx for teacher application
import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/layout";
import Dashboard from "./pages/dashboard";
import GlossaryPage from "./pages/glossary";
import Materials from "./pages/materials";
import CreateVideo from "./pages/create-video";
import VideoDetailPage from "./pages/videoDetail";
import AddTest from "./pages/createTestPage";
import PracticeList from "./pages/practiceList";
import EditProfile from "./pages/settings";
import TeacherSubmissions from "./pages/notification";
import AddMatchingTest from "./pages/matchingTestCreate";
import TestTypeSelection from "./pages/TestTypeSelection";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/auth/sign" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout active={"Bosh Sahifa"} activePage={<Dashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practicum-tests"
          element={
            <ProtectedRoute>
              <Layout
                active={"Praktik testlar"}
                activePage={<PracticeList />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <Layout active={"Materiyallar"} activePage={<Materials />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/glossary"
          element={
            <ProtectedRoute>
              <Layout active={"Glossary"} activePage={<GlossaryPage />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout active={"Sozlamalar"} activePage={<EditProfile />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:id"
          element={
            <ProtectedRoute>
              <Layout active={"Bosh Sahifa"} activePage={<VideoDetailPage />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-video"
          element={
            <ProtectedRoute>
              <Layout active={"Bosh Sahifa"} activePage={<CreateVideo />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:videoId/add-test"
          element={
            <ProtectedRoute>
              <Layout active={"Bosh Sahifa"} activePage={<AddTest />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:videoId/add-matching-test"
          element={
            <ProtectedRoute>
              <Layout active={"Bosh Sahifa"} activePage={<AddMatchingTest />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout active={"Xabarlar"} activePage={<TeacherSubmissions />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:videoId/select-test-type"
          element={
            <ProtectedRoute>
              <Layout
                active={"Bosh Sahifa"}
                activePage={<TestTypeSelection />}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
