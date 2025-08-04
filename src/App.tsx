import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./context/ProtectedRoute";
import { CardVisibilityProvider } from "./context/CardVisibilityContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import BeachHouse from './components/sections/BeachHouse';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CardVisibilityProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index accessor={true} />} />
            <Route path="/relatorio-cliente" element={<ProtectedRoute><Index clientPropect={true} /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CardVisibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
