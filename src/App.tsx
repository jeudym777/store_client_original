import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
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
        <CustomerAuthProvider>
          <CartProvider>
            <CategoryProvider>
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/gracias" element={<Gracias />} />
                <Route path="/perfil" element={<CustomerProfilePage />} />
                <Route path="/mis-puntos" element={<CustomerProfilePage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
              </Routes>

              </BrowserRouter>
            </CategoryProvider>
          </CartProvider>
        </CustomerAuthProvider>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}
