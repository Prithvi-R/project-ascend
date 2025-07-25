import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import Index from "./pages/home";
import Dashboard from "./pages/dashboard";
import EnhancedExercises from "./pages/enhanced-exercises";
import Nutrition from "./pages/nutrition";
import Quests from "./pages/quests";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Login from "./pages/login";
import NotFound from "./pages/404";

const queryClient = new QueryClient();

const App = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogin = () => {
    // Navigation to login page is handled by the login button
    window.location.href = '/login';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster richColors />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header 
              user={isAuthenticated && user ? {
                username: user.username,
                level: user.player_stats?.level || 1,
                totalXp: user.player_stats?.total_xp || 0,
              } : undefined}
              onLogin={handleLogin}
              onLogout={logout}
            />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/exercises" element={<EnhancedExercises />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;