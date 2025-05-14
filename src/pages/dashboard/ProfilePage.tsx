
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    jobTitle: "Product Manager",
    department: "Product",
    location: "New York, USA",
    bio: "Product Manager with 5+ years of experience in SaaS products.",
    avatarUrl: "",
  });
  
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast.error("New passwords don't match.");
      return;
    }
    
    toast.success("Password changed successfully!");
    setPassword({
      current: "",
      new: "",
      confirm: "",
    });
  };

  return (
    <>
      <DashboardHeader title="Profile" />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="flex flex-col items-center justify-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={profileData.avatarUrl} alt="Profile" />
                          <AvatarFallback className="bg-purple-100 text-purple-900">
                            <User className="h-12 w-12" />
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">Change Photo</Button>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First name</Label>
                            <Input 
                              id="firstName" 
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last name</Label>
                            <Input 
                              id="lastName" 
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input 
                            id="jobTitle" 
                            value={profileData.jobTitle}
                            onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input 
                            id="department" 
                            value={profileData.department}
                            onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea 
                          id="bio" 
                          className="w-full h-24 px-3 py-2 text-base placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password"
                          value={password.current}
                          onChange={(e) => setPassword({...password, current: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={password.new}
                          onChange={(e) => setPassword({...password, new: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={password.confirm}
                          onChange={(e) => setPassword({...password, confirm: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                        Change Password
                      </Button>
                    </div>
                  </form>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                    <p className="text-gray-500 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-red-500">Danger Zone</h3>
                    <p className="text-gray-500 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { id: "email-tasks", label: "Task assignments and updates" },
                          { id: "email-projects", label: "Project updates and milestones" },
                          { id: "email-comments", label: "Comments on your tasks" },
                          { id: "email-team", label: "Team announcements" },
                        ].map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <Label htmlFor={item.id} className="cursor-pointer">
                              {item.label}
                            </Label>
                            <input
                              type="checkbox"
                              id={item.id}
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { id: "push-tasks", label: "Task assignments and updates" },
                          { id: "push-projects", label: "Project updates and milestones" },
                          { id: "push-comments", label: "Comments on your tasks" },
                          { id: "push-team", label: "Team announcements" },
                        ].map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <Label htmlFor={item.id} className="cursor-pointer">
                              {item.label}
                            </Label>
                            <input
                              type="checkbox"
                              id={item.id}
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => toast.success("Notification settings saved!")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
