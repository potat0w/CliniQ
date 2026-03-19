import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthInput } from "./ui/AuthInput";
import { AuthSelect } from "./ui/AuthSelect";
import { Button } from "./ui/button";
import { Stethoscope, UserCog, Heart } from "lucide-react";
import { useAuth } from "@api-hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type UserRole = "patient" | "admin" | "doctor";
type AuthMode = "login" | "signup";

const roleConfig = {
  patient: { icon: Heart, label: "Patient", dashboard: "/patient-dashboard" },
  admin: { icon: UserCog, label: "Admin", dashboard: "/admin-dashboard" },
  doctor: { icon: Stethoscope, label: "Doctor", dashboard: "/doctor-dashboard" },
};

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const specialityOptions = [
  { value: "cardiologist", label: "Cardiologist" },
  { value: "neurologist", label: "Neurologist" },
  { value: "dermatologist", label: "Dermatologist" },
  { value: "orthopedic", label: "Orthopedic" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "general", label: "General Physician" },
];

const SignupForm = () => {
  const navigate = useNavigate();
  const { loading, error, signup, login } = useAuth();
  const [role, setRole] = useState<UserRole>("patient");
  const [mode, setMode] = useState<AuthMode>("signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "male",
    speciality: "general",
    education: "",
    experience: "",
  });

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dashboard = roleConfig[role].dashboard;
      if (mode === "signup") {
        const payload: Record<string, string> = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
        };
        if (role === "patient") {
          payload.phone = formData.phone;
          payload.age = formData.age;
          payload.gender = formData.gender;
        }
        if (role === "doctor") {
          payload.speciality = formData.speciality;
          payload.education = formData.education;
          payload.experience = formData.experience;
        }
        await signup(payload, role);
        toast({ title: "Account created!", description: "Welcome! Redirecting to dashboard." });
      } else {
        await login(formData.email, formData.password, role);
        toast({ title: "Logged in!", description: "Welcome back!" });
      }
      navigate(dashboard);
    } catch {
      toast({ title: "Error", description: error || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-primary mb-1">
          {React.createElement(roleConfig[role].icon, { className: "w-4 h-4" })}
          <span className="text-xs font-medium">{roleConfig[role].label}</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          {mode === "signup" ? "Create a new account" : "Welcome back"}
        </h1>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex gap-4 mb-3 border-b border-border">
        {(["login", "signup"] as AuthMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`pb-1.5 text-xs font-medium transition-colors relative capitalize ${
              mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
            {mode === m && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Role Toggle */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">I am a:</label>
          <div className="flex gap-1.5">
            {(Object.keys(roleConfig) as UserRole[]).map((r) => {
              const Icon = roleConfig[r].icon;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 flex items-center justify-center gap-1 h-8 rounded-lg transition-all text-xs ${
                    role === r
                      ? "bg-primary text-primary-foreground"
                      : "neumorphic-input text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-medium">{roleConfig[r].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {mode === "signup" && (
          <AuthInput label="Full Name" type="text" placeholder="John Doe" value={formData.name} onChange={update("name")} />
        )}

        <AuthInput label="Email" type="email" placeholder="your@email.com" value={formData.email} onChange={update("email")} />
        <AuthInput label="Password" showPasswordToggle placeholder="••••••••" value={formData.password} onChange={update("password")} />

        {/* Patient-specific fields */}
        {mode === "signup" && role === "patient" && (
          <>
            <AuthInput label="Phone Number" type="tel" placeholder="+1234567890" value={formData.phone} onChange={update("phone")} />
            <div className="grid grid-cols-2 gap-2">
              <AuthInput label="Age" type="number" placeholder="25" value={formData.age} onChange={update("age")} />
              <AuthSelect label="Gender" options={genderOptions} value={formData.gender} onChange={update("gender")} />
            </div>
          </>
        )}

        {/* Doctor-specific fields */}
        {mode === "signup" && role === "doctor" && (
          <>
            <AuthSelect label="Speciality" options={specialityOptions} value={formData.speciality} onChange={update("speciality")} />
            <AuthInput label="Education" type="text" placeholder="MBBS, MD Cardiology" value={formData.education} onChange={update("education")} />
            <AuthInput label="Experience (years)" type="number" placeholder="5" value={formData.experience} onChange={update("experience")} />
          </>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2 text-xs transition-all hover:scale-[1.01]"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground mt-3">
        {mode === "signup" ? (
          <>Already have an account?{" "}<button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></>
        ) : (
          <>Don't have an account?{" "}<button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
        )}
      </p>
    </div>
  );
};

export default SignupForm;
