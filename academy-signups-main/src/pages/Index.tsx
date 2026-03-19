import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "@/components/SignupForm";
import CosmicBackground from "@/components/CosmicBackground";
import { useAuth } from "@api-hooks/useAuth";

const roleDashboard: Record<string, string> = {
  doctor: "/doctor-dashboard",
  patient: "/patient-dashboard",
  admin: "/admin-dashboard",
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRole() || "patient";
      navigate(roleDashboard[role] || "/patient-dashboard", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="neumorphic-card p-4 md:p-6 lg:p-8 w-full max-w-md">
          <SignupForm />
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-4 rounded-3xl overflow-hidden">
          <CosmicBackground />
        </div>
      </div>
    </div>
  );
};

export default Index;
