import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as: {user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage your blog posts and articles.
              </p>
              <Button className="w-full">Manage Posts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and respond to contact form submissions.
              </p>
              <Button className="w-full">View Messages</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure site settings and preferences.
              </p>
              <Button className="w-full">Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;