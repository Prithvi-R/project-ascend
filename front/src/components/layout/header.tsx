import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sword,
  User,
  Settings,
  LogOut,
  Menu,
  Crown,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { userAPI } from "@/services/api";

interface HeaderProps {
  user?: {
    username: string;
    level: number;
    totalXp: number;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user: authUser } = useAuth();

  // Fetch real-time player stats for the header
  const { data: playerStats } = useQuery({
    queryKey: ['player-stats'],
    queryFn: () => userAPI.getPlayerStats(),
    enabled: isAuthenticated,
    select: (response) => response.data,
    refetchInterval: 30000, // Refetch every 30 seconds to keep stats fresh
  });

  // Use real-time player stats if available, otherwise fall back to user prop
  const displayUser = isAuthenticated && authUser && playerStats ? {
    username: authUser.username,
    level: playerStats.level,
    totalXp: playerStats.total_xp,
  } : user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Sword className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Project Ascend
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/exercises"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Exercise Library
          </Link>
          <Link
            to="/nutrition"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Nutrition
          </Link>
          <Link
            to="/quests"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Quests
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {displayUser ? (
            <>
              {/* User Stats (Desktop) */}
              <div className="hidden lg:flex items-center space-x-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Level {displayUser.level}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="w-3 h-3 mr-1" />
                  {displayUser.totalXp.toLocaleString()} XP
                </Badge>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {displayUser.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayUser.username}</p>
                      <p className="text-xs text-slate-500">
                        Level {displayUser.level} • {displayUser.totalXp.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={onLogin} size="sm">
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  to="/dashboard"
                  className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/exercises"
                  className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Exercise Library
                </Link>
                <Link
                  to="/nutrition"
                  className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nutrition
                </Link>
                <Link
                  to="/quests"
                  className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Quests
                </Link>
                
                {displayUser && (
                  <>
                    <div className="border-t border-slate-200 pt-4 mt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Level {displayUser.level}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Zap className="w-3 h-3 mr-1" />
                          {displayUser.totalXp.toLocaleString()} XP
                        </Badge>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="text-lg font-medium text-slate-900 hover:text-purple-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onLogout?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}