import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <AlertCircle className="w-24 h-24 text-primary mx-auto mb-4 opacity-80" />
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-warm-600 transition font-bold"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-warm-50 transition font-bold"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="BeyondBooks Logo" className="w-5 h-5" />
            </div>
            Back to Login
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-warm-200">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}
