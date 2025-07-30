import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, signOut, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Travel Blog Platform</h1>
        <p className="text-xl text-muted-foreground">Secure, modern travel blogging with admin controls</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <div className="text-sm text-muted-foreground">
                Welcome back, {user.email}
              </div>
              {isAdmin && (
                <Button asChild>
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          )}
        </div>

        <div className="mt-8 text-sm text-muted-foreground max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Security Features Implemented:</h3>
          <ul className="text-left space-y-1">
            <li>✅ Row Level Security (RLS) on all tables</li>
            <li>✅ Role-based access control (Admin/Employee)</li>
            <li>✅ Secure authentication with Supabase</li>
            <li>✅ Input validation and sanitization</li>
            <li>✅ Protected admin routes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
