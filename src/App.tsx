import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient";
import { ToastContainer } from "react-toastify";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import Gracias from "./components/Gracias";


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <CategoryProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/gracias" element={<Gracias />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Routes>

            </BrowserRouter>
          </CategoryProvider>
        </CartProvider>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}
