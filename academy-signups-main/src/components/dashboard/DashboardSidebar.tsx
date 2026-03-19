 import { BookOpen, Users, FolderOpen, BarChart3, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { cn } from "@/lib/utils";
 import { toast } from "@/hooks/use-toast";
 import { useAuth } from "@api-hooks/useAuth";
 import type { DashboardTab } from "@/pages/TeacherDashboard";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 
 interface DashboardSidebarProps {
   activeTab: DashboardTab;
   onTabChange: (tab: DashboardTab) => void;
 }
 
 const tabs = [
   { id: "view-courses" as const, label: "View Courses", icon: BookOpen },
   { id: "view-students" as const, label: "View Students", icon: Users },
   { id: "my-courses" as const, label: "My Courses", icon: FolderOpen },
   { id: "course-stats" as const, label: "Course Stats", icon: BarChart3 },
 ];
 
 export const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
   const [isMobileOpen, setIsMobileOpen] = useState(false);
   const [isCollapsed, setIsCollapsed] = useState(false);
   const navigate = useNavigate();
   const { logout } = useAuth();
 
   const handleLogout = () => {
     logout();
     toast({
       title: "Logged out",
       description: "You have been successfully logged out.",
     });
     navigate("/");
   };
 
   const handleTabClick = (tabId: DashboardTab) => {
     onTabChange(tabId);
     setIsMobileOpen(false);
   };
 
   return (
     <>
       {/* Mobile Menu Button */}
       <button
         className="fixed top-3 left-3 z-50 md:hidden p-1.5 rounded-lg bg-card border border-border"
         onClick={() => setIsMobileOpen(!isMobileOpen)}
       >
         {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
       </button>
 
       {/* Mobile Overlay */}
       {isMobileOpen && (
         <div 
           className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
           onClick={() => setIsMobileOpen(false)}
         />
       )}
 
       {/* Mobile Sidebar */}
       <aside
         className={cn(
           "fixed left-0 top-0 h-full w-56 z-50 md:hidden flex flex-col",
           "bg-card border-r border-border",
           "transition-transform duration-300 ease-out",
           isMobileOpen ? "translate-x-0" : "-translate-x-full"
         )}
       >
         <SidebarInner activeTab={activeTab} onTabClick={handleTabClick} onLogout={handleLogout} isCollapsed={false} />
       </aside>
 
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0",
            "bg-card border-r border-border",
            "transition-all duration-300",
            isCollapsed ? "w-14" : "w-56"
          )}
       >
         <SidebarInner 
           activeTab={activeTab} 
           onTabClick={handleTabClick} 
           onLogout={handleLogout} 
           isCollapsed={isCollapsed}
           onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
         />
       </aside>
     </>
   );
 };
 
 interface SidebarInnerProps {
   activeTab: DashboardTab;
   onTabClick: (tab: DashboardTab) => void;
   onLogout: () => void;
   isCollapsed: boolean;
   onToggleCollapse?: () => void;
 }
 
 const SidebarInner = ({ activeTab, onTabClick, onLogout, isCollapsed, onToggleCollapse }: SidebarInnerProps) => (
   <>
     {/* Logo */}
     <div className={cn("p-3 border-b border-border", isCollapsed && "px-2")}>
       <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2")}>
         <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
           <span className="text-sm">🎓</span>
         </div>
         {!isCollapsed && <span className="text-foreground font-medium text-sm">Teacher Portal</span>}
       </div>
     </div>
 
     {/* Navigation */}
     <nav className={cn("flex-1 p-2 space-y-0.5", isCollapsed && "px-1.5")}>
       {tabs.map((tab) => {
         const Icon = tab.icon;
         const isActive = activeTab === tab.id;
         
         const button = (
           <button
             onClick={() => onTabClick(tab.id)}
             className={cn(
               "w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors text-sm",
               "hover:bg-muted",
               isActive && "bg-muted text-foreground",
               !isActive && "text-muted-foreground",
               isCollapsed && "justify-center px-2"
             )}
           >
             <Icon className="w-4 h-4 flex-shrink-0" />
             {!isCollapsed && <span className="font-medium">{tab.label}</span>}
           </button>
         );
 
         if (isCollapsed) {
           return (
             <Tooltip key={tab.id} delayDuration={0}>
               <TooltipTrigger asChild>{button}</TooltipTrigger>
               <TooltipContent side="right" className="text-xs">
                 {tab.label}
               </TooltipContent>
             </Tooltip>
           );
         }
 
         return <div key={tab.id}>{button}</div>;
       })}
     </nav>
 
     {/* Collapse Toggle & Logout */}
     <div className={cn("p-2 border-t border-border space-y-0.5", isCollapsed && "px-1.5")}>
       {onToggleCollapse && (
         <button
           onClick={onToggleCollapse}
           className={cn(
             "w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors text-sm",
             "hover:bg-muted text-muted-foreground",
             isCollapsed && "justify-center px-2"
           )}
         >
           {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
           {!isCollapsed && <span className="font-medium">Collapse</span>}
         </button>
       )}
       
       {isCollapsed ? (
         <Tooltip delayDuration={0}>
           <TooltipTrigger asChild>
             <button
               onClick={onLogout}
               className={cn(
                 "w-full flex items-center justify-center px-2 py-2 rounded-md transition-colors text-sm",
                 "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
               )}
             >
               <LogOut className="w-4 h-4" />
             </button>
           </TooltipTrigger>
           <TooltipContent side="right" className="text-xs">Logout</TooltipContent>
         </Tooltip>
       ) : (
         <button
           onClick={onLogout}
           className={cn(
             "w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors text-sm",
             "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
           )}
         >
           <LogOut className="w-4 h-4" />
           <span className="font-medium">Logout</span>
         </button>
       )}
     </div>
   </>
 );