import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/layout";
import Dashboard from "./pages/dashboard";
import PracticTests from "./pages/practicTests";
import Materials from "./pages/materials";
import CreateVideo from "./pages/create-video";
import VideoDetailPage from "./pages/videoDetail";
import AddTest from "./pages/createTestPage";
import PracticeList from "./pages/practiceList";
import EditProfile from "./pages/settings";
import TeacherSubmissions from "./pages/notification";
import AddMatchingTest from "./pages/matchingTestCreate";
import TestTypeSelection from "./pages/TestTypeSelection";

const App = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("ziyo-jwt")) navigate("/auth/login");
  }, []);
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/auth/sign" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route
          path="/"
          element={<Layout active={"Bosh Sahifa"} activePage={<Dashboard />} />}
        />
        <Route
          path="/practicum-tests"
          element={
            <Layout active={"Praktik testlar"} activePage={<PracticeList />} />
          }
        />
        <Route
          path="/materials"
          element={
            <Layout active={"Materiyallar"} activePage={<Materials />} />
          }
        />
        <Route
          path="/settings"
          element={
            <Layout active={"Sozlamalar"} activePage={<EditProfile />} />
          }
        />
        <Route
          path="/video/:id"
          element={
            <Layout active={"Bosh Sahifa"} activePage={<VideoDetailPage />} />
          }
        />
        <Route
          path="/create-video"
          element={
            <Layout active={"Bosh Sahifa"} activePage={<CreateVideo />} />
          }
        />
        <Route
          path="/video/:videoId/add-test"
          element={<Layout active={"Bosh Sahifa"} activePage={<AddTest />} />}
        />
        <Route
          path="/video/:videoId/add-matching-test"
          element={
            <Layout active={"Bosh Sahifa"} activePage={<AddMatchingTest />} />
          }
        />
        <Route
          path="/notifications"
          element={
            <Layout active={"Xabarlar"} activePage={<TeacherSubmissions />} />
          }
        />
        <Route
          path="/video/:videoId/select-test-type"
          element={
            <Layout active={"Bosh Sahifa"} activePage={<TestTypeSelection />} />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
