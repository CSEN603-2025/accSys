// Utility to get the page title based on path and user role
export function getPageTitle(pathname, userRole) {
  if (pathname === "/" && userRole) {
    if (userRole === "student") return "Student Dashboard";
    if (userRole === "faculty") return "Faculty Dashboard";
    if (userRole === "company") return "Company Dashboard";
    if (userRole === "scad") return "SCAD Dashboard";
    return "Dashboard";
  }
  if (pathname.startsWith("/companies")) return "Companies";
  if (pathname.startsWith("/internships")) return "Internships";
  if (pathname.startsWith("/student/reports")) return "Reports";
  if (pathname.startsWith("/student")) return "Student Dashboard";
  if (pathname.startsWith("/faculty")) return "Faculty Dashboard";
  if (pathname.startsWith("/company")) return "Company Dashboard";
  if (pathname.startsWith("/scad")) return "SCAD Dashboard";
  if (pathname.startsWith("/applications")) return "Applications";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/workshops")) return "Workshops";
  if (pathname.startsWith("/workshop/")) return "Workshop ";
  return "Internship Portal";
}
