import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Smartphone,
  Download,
  Upload,
  Trash2,
  Save,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Key,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  Zap,
  Target,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Info,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  Monitor,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  
  // App Settings
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    language: 'en',
    units: 'metric',
    timeFormat: '12h',
    startOfWeek: 'monday',
    storagePreference: user?.storage_preference || 'cloud',
    autoSync: true,
    offlineMode: false,
  });
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    questUpdates: true,
    achievementUnlocks: true,
    weeklyProgress: true,
    socialUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
    soundEffects: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    workoutVisibility: 'friends',
    achievementVisibility: 'public',
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataCollection: true,
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginNotifications: true,
    dataExport: false,
  });

  const handleSaveSettings = () => {
    // Here you would save settings to your backend
    console.log("Saving settings:", {
      notifications,
      privacy,
      appSettings,
      accountSettings,
    });
    // Show success message
    alert("Settings saved successfully!");
  };

  const handleExportData = () => {
    // Here you would trigger data export
    console.log("Exporting user data...");
    alert("Data export initiated. You'll receive an email when ready.");
  };

  const handleDeleteAccount = () => {
    // Here you would handle account deletion
    console.log("Account deletion requested...");
    alert("Account deletion request submitted. This action cannot be undone.");
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setAppSettings(prev => ({ ...prev, theme: newTheme }));
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto mode - check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const updateSetting = (key: string, value: any) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to access settings.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground">Customize your Project Ascend experience</p>
          {user && (
            <div className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{user.username}</span> ({user.email})
            </div>
          )}
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Workout Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Workout & Training</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Workout Reminders</div>
                        <div className="text-sm text-muted-foreground">Get reminded about scheduled workouts</div>
                      </div>
                      <Switch
                        checked={notifications.workoutReminders}
                        onCheckedChange={(checked) => setNotifications({...notifications, workoutReminders: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Quest Updates</div>
                        <div className="text-sm text-muted-foreground">Notifications about new quests and completions</div>
                      </div>
                      <Switch
                        checked={notifications.questUpdates}
                        onCheckedChange={(checked) => setNotifications({...notifications, questUpdates: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Achievement Unlocks</div>
                        <div className="text-sm text-muted-foreground">Celebrate when you unlock new achievements</div>
                      </div>
                      <Switch
                        checked={notifications.achievementUnlocks}
                        onCheckedChange={(checked) => setNotifications({...notifications, achievementUnlocks: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Progress Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Progress & Social</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Weekly Progress</div>
                        <div className="text-sm text-muted-foreground">Weekly summary of your achievements</div>
                      </div>
                      <Switch
                        checked={notifications.weeklyProgress}
                        onCheckedChange={(checked) => setNotifications({...notifications, weeklyProgress: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Social Updates</div>
                        <div className="text-sm text-muted-foreground">Friend activities and challenges</div>
                      </div>
                      <Switch
                        checked={notifications.socialUpdates}
                        onCheckedChange={(checked) => setNotifications({...notifications, socialUpdates: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Delivery Methods</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Email Notifications</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>Push Notifications</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Browser and mobile push notifications</div>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <Volume2 className="w-4 h-4" />
                          <span>Sound Effects</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Play sounds for achievements and milestones</div>
                      </div>
                      <Switch
                        checked={notifications.soundEffects}
                        onCheckedChange={(checked) => setNotifications({...notifications, soundEffects: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Visibility</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Profile Visibility</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Profile Visibility</div>
                        <div className="text-sm text-muted-foreground">Who can see your profile information</div>
                      </div>
                      <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Workout Visibility</div>
                        <div className="text-sm text-muted-foreground">Who can see your workout history</div>
                      </div>
                      <Select value={privacy.workoutVisibility} onValueChange={(value) => setPrivacy({...privacy, workoutVisibility: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Achievement Visibility</div>
                        <div className="text-sm text-muted-foreground">Who can see your achievements</div>
                      </div>
                      <Select value={privacy.achievementVisibility} onValueChange={(value) => setPrivacy({...privacy, achievementVisibility: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Social Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Allow Friend Requests</div>
                        <div className="text-sm text-muted-foreground">Let others send you friend requests</div>
                      </div>
                      <Switch
                        checked={privacy.allowFriendRequests}
                        onCheckedChange={(checked) => setPrivacy({...privacy, allowFriendRequests: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Show Online Status</div>
                        <div className="text-sm text-muted-foreground">Display when you're active</div>
                      </div>
                      <Switch
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => setPrivacy({...privacy, showOnlineStatus: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Data Collection</div>
                        <div className="text-sm text-muted-foreground">Allow analytics to improve the app</div>
                      </div>
                      <Switch
                        checked={privacy.dataCollection}
                        onCheckedChange={(checked) => setPrivacy({...privacy, dataCollection: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance & Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how Project Ascend looks to you. Current theme: <Badge variant="secondary">{appSettings.theme}</Badge>
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        appSettings.theme === 'light' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Sun className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Light</span>
                        {appSettings.theme === 'light' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="w-full h-8 bg-white border border-slate-200 rounded shadow-sm"></div>
                      <div className="text-xs text-muted-foreground mt-2">Clean and bright</div>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        appSettings.theme === 'dark' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Moon className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Dark</span>
                        {appSettings.theme === 'dark' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="w-full h-8 bg-slate-800 border border-slate-600 rounded shadow-sm"></div>
                      <div className="text-xs text-muted-foreground mt-2">Easy on the eyes</div>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        appSettings.theme === 'auto' 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                      onClick={() => handleThemeChange('auto')}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <Monitor className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Auto</span>
                        {appSettings.theme === 'auto' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="w-full h-8 bg-gradient-to-r from-white to-slate-800 border border-slate-200 rounded shadow-sm"></div>
                      <div className="text-xs text-muted-foreground mt-2">Follows system</div>
                    </div>
                  </div>

                  {appSettings.theme === 'auto' && (
                    <div className="p-3 bg-accent/50 rounded-lg border border-border">
                      <div className="flex items-center space-x-2 text-sm">
                        <Info className="w-4 h-4 text-primary" />
                        <span>Currently using <strong>system</strong> theme based on your system preference</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Language & Region */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Language & Region</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={appSettings.language} onValueChange={(value) => updateSetting('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          <SelectItem value="zh">🇨🇳 中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="units">Units</Label>
                      <Select value={appSettings.units} onValueChange={(value) => updateSetting('units', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start-of-week">Start of Week</Label>
                      <Select value={appSettings.startOfWeek} onValueChange={(value) => updateSetting('startOfWeek', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select value={appSettings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password & Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Password & Authentication</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Change Password</div>
                        <div className="text-sm text-muted-foreground">Update your account password</div>
                      </div>
                      <Button variant="outline">
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={accountSettings.twoFactorEnabled ? "default" : "secondary"}>
                          {accountSettings.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAccountSettings({...accountSettings, twoFactorEnabled: !accountSettings.twoFactorEnabled})}
                        >
                          {accountSettings.twoFactorEnabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Session Timeout</div>
                        <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                      </div>
                      <Select value={accountSettings.sessionTimeout} onValueChange={(value) => setAccountSettings({...accountSettings, sessionTimeout: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Login Notifications</div>
                        <div className="text-sm text-muted-foreground">Get notified of new logins</div>
                      </div>
                      <Switch
                        checked={accountSettings.loginNotifications}
                        onCheckedChange={(checked) => setAccountSettings({...accountSettings, loginNotifications: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Download Your Data</div>
                        <div className="text-sm text-muted-foreground">Export all your account data</div>
                      </div>
                      <Button variant="outline" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-destructive">Delete Account</div>
                        <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data & Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Storage Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Storage Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        appSettings.storagePreference === 'cloud' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateSetting('storagePreference', 'cloud')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Cloud Storage</span>
                        {appSettings.storagePreference === 'cloud' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sync across all devices, automatic backups
                      </div>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        appSettings.storagePreference === 'local' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateSetting('storagePreference', 'local')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <HardDrive className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Local Storage</span>
                        {appSettings.storagePreference === 'local' && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Store data locally, enhanced privacy
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sync Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Sync Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <Wifi className="w-4 h-4" />
                          <span>Auto Sync</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Automatically sync data when online</div>
                      </div>
                      <Switch
                        checked={appSettings.autoSync}
                        onCheckedChange={(checked) => updateSetting('autoSync', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <WifiOff className="w-4 h-4" />
                          <span>Offline Mode</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Continue using the app without internet</div>
                      </div>
                      <Switch
                        checked={appSettings.offlineMode}
                        onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Manual Sync</div>
                        <div className="text-sm text-muted-foreground">Force sync all data now</div>
                      </div>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Data Usage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Data Usage</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">2.4 MB</div>
                        <div className="text-sm text-muted-foreground">Workout Data</div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">1.8 MB</div>
                        <div className="text-sm text-muted-foreground">Nutrition Data</div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">0.6 MB</div>
                        <div className="text-sm text-muted-foreground">Profile Data</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button onClick={handleSaveSettings} size="lg" className="px-8">
            <Save className="w-5 h-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}