
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileSettings {
  theme_preference: string;
  compact_mode: boolean;
  language_preference: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  task_reminders: boolean;
  mentions: boolean;
  auto_save: boolean;
  usage_analytics: boolean;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    theme_preference: 'light',
    compact_mode: false,
    language_preference: 'English (US)',
    email_notifications: true,
    browser_notifications: true,
    task_reminders: true,
    mentions: true,
    auto_save: true,
    usage_analytics: false
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          theme_preference,
          compact_mode,
          language_preference,
          email_notifications,
          browser_notifications,
          task_reminders,
          mentions,
          auto_save,
          usage_analytics
        `)
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setSettings({
        theme_preference: data.theme_preference || 'light',
        compact_mode: !!data.compact_mode,
        language_preference: data.language_preference || 'English (US)',
        email_notifications: data.email_notifications !== false, // default to true if null
        browser_notifications: data.browser_notifications !== false,
        task_reminders: data.task_reminders !== false,
        mentions: data.mentions !== false,
        auto_save: data.auto_save !== false,
        usage_analytics: !!data.usage_analytics
      });
    } catch (error: any) {
      toast.error("Failed to load settings");
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key: keyof ProfileSettings, value: any) => {
    try {
      setSaving(true);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Update in database
      const { error } = await supabase
        .from("profiles")
        .update({ [key]: value })
        .eq("id", user?.id);
      
      if (error) throw error;
      
      toast.success(`${key.replace(/_/g, ' ')} updated successfully`);
      
      // Apply theme if that was changed
      if (key === 'theme_preference') {
        // This would be where we'd actually apply the theme
        // For now we'll just show a toast
        toast.info(`Theme changed to ${value}`);
      }
    } catch (error: any) {
      // Revert local state if there was an error
      fetchSettings();
      toast.error("Failed to update setting");
      console.error("Error updating setting:", error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      setResetPasswordLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      console.error("Error changing password:", error);
    } finally {
      setResetPasswordLoading(false);
    }
  };
  
  const handleSwitchChange = (key: keyof ProfileSettings) => {
    updateSettings(key, !settings[key]);
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      
      // Fetch user data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (projectsError) throw projectsError;
      
      // Fetch all tasks for user's projects
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user?.id);
      
      if (tasksError) throw tasksError;
      
      // Combine data
      const exportData = {
        user: {
          email: user?.email,
        },
        profile: {
          first_name: user?.user_metadata?.first_name,
          last_name: user?.user_metadata?.last_name
        },
        settings,
        projects,
        tasks
      };
      
      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `taskify-export-${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Data exported successfully");
    } catch (error: any) {
      toast.error("Failed to export data");
      console.error("Error exporting data:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-mode" className="text-base font-medium">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Use dark theme for the application</p>
                  </div>
                  <Switch 
                    id="theme-mode" 
                    checked={settings.theme_preference === 'dark'}
                    disabled={saving}
                    onCheckedChange={(checked) => updateSettings('theme_preference', checked ? 'dark' : 'light')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode" className="text-base font-medium">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Make the UI more compact</p>
                  </div>
                  <Switch 
                    id="compact-mode" 
                    checked={settings.compact_mode}
                    disabled={saving}
                    onCheckedChange={() => handleSwitchChange('compact_mode')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Application Language</Label>
                    <p className="text-sm text-gray-500">The language used across the application</p>
                  </div>
                  <Select 
                    value={settings.language_preference}
                    onValueChange={(value) => updateSettings('language_preference', value)}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={settings.email_notifications}
                  disabled={saving}
                  onCheckedChange={() => handleSwitchChange('email_notifications')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browser-notifications" className="text-base font-medium">Browser Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                </div>
                <Switch 
                  id="browser-notifications" 
                  checked={settings.browser_notifications}
                  disabled={saving}
                  onCheckedChange={() => handleSwitchChange('browser_notifications')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="task-reminders" className="text-base font-medium">Task Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminders for upcoming tasks</p>
                </div>
                <Switch 
                  id="task-reminders" 
                  checked={settings.task_reminders}
                  disabled={saving}
                  onCheckedChange={() => handleSwitchChange('task_reminders')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mentions" className="text-base font-medium">Mentions</Label>
                  <p className="text-sm text-gray-500">Get notified when someone mentions you</p>
                </div>
                <Switch 
                  id="mentions" 
                  checked={settings.mentions}
                  disabled={saving}
                  onCheckedChange={() => handleSwitchChange('mentions')} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save" className="text-base font-medium">Auto-save Changes</Label>
                    <p className="text-sm text-gray-500">Automatically save changes as you make them</p>
                  </div>
                  <Switch 
                    id="auto-save" 
                    checked={settings.auto_save}
                    disabled={saving}
                    onCheckedChange={() => handleSwitchChange('auto_save')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics" className="text-base font-medium">Usage Analytics</Label>
                    <p className="text-sm text-gray-500">Allow anonymous usage data collection</p>
                  </div>
                  <Switch 
                    id="analytics" 
                    checked={settings.usage_analytics}
                    disabled={saving}
                    onCheckedChange={() => handleSwitchChange('usage_analytics')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="export-data" className="text-base font-medium">Data Export</Label>
                    <p className="text-sm text-gray-500">Export your project data</p>
                  </div>
                  <Button 
                    className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={handleExportData}
                    disabled={saving}
                  >
                    {saving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
                    ) : (
                      "Export"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <Button 
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading || !newPassword || !confirmPassword}
                  className="mt-2"
                >
                  {resetPasswordLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing Password...</>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
