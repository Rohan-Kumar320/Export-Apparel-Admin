import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Login from "./components/Login";
import Dashboard from "./components/Dasboard";
import ProductsPage from "./components/ProductPage";
import ProductForm from "./components/ProductForm";
import CategoriesPage from "./components/CategoriesPage";
import CategoryForm from "./components/CategoryForm";
import OrdersPage from "./components/OrdersPage";


const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      console.log("Auth state changed:", u ? u.email : "No user");
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-sm sm:text-base">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute><ProductsPage /></ProtectedRoute>}
        />
        <Route
          path="/products/new"
          element={<ProtectedRoute><ProductForm /></ProtectedRoute>}
        />
        <Route
          path="/products/edit/:id"
          element={<ProtectedRoute><ProductForm /></ProtectedRoute>}
        />
        <Route
          path="/categories"
          element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>}
        />
        <Route
          path="/categories/new"
          element={<ProtectedRoute><CategoryForm /></ProtectedRoute>}
        />
        <Route
          path="/categories/edit/:id"
          element={<ProtectedRoute><CategoryForm /></ProtectedRoute>}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;