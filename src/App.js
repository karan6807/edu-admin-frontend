// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ManageCourses from "./pages/ManageCourses";
import ManageUsers from "./pages/ManageUsers";
import ManageOrders from "./pages/ManageOrders";
import ManageCategories from "./pages/ManageCategories";
import AdminLogin from "./pages/AdminLogin";
import AddCourse from "./pages/AddCourse";
import ManageContacts from "./pages/ManageContacts";
import Instructors from "./pages/Instructors";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login route - no Layout wrapper needed */}
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Protected routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/courses"
          element={
            <Layout>
              <ManageCourses />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <ManageUsers />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <ManageOrders />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout>
              <ManageCategories />
            </Layout>
          }
        />
        <Route
          path="/add-course"
          element={
            <Layout>
              <AddCourse />
            </Layout>
          }
        />
        <Route
          path="/instructors"
          element={
            <Layout>
              <Instructors />
            </Layout>
          }
        />
        <Route
          path="/add-course"
          element={
            <Layout>
              <AddCourse />
            </Layout>
          }
        />
        <Route
          path="/contacts"
          element={
            <Layout>
              <ManageContacts />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;