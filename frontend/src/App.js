import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AddStudent from "./components/AddStudent";
import FaceRecognition from "./components/FaceRecognition";
import FaceRecognitionTest from "./components/FaceRecognitionTest";
import AttendanceTable from "./components/AttendanceTable";
import Navbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

function FaceRecognitionWrapper() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  return mode === "debug" ? <FaceRecognitionTest /> : <FaceRecognition />;
}

function Layout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/face"
          element={
            <ProtectedRoute>
              <FaceRecognitionWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add_student"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance-table"
          element={
            <ProtectedRoute>
              <AttendanceTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
