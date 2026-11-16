"use client";

import { BookOpenCheck, GraduationCap, LayoutDashboard, PlusCircle } from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

const nav: NavGroup[] = [
  { items: [
    { href: "/instructor/", label: "Today", icon: LayoutDashboard },
    { href: "/instructor/classroom/", label: "Digital Marketing Bootcamp", icon: GraduationCap },
    { href: "/instructor/grading/", label: "Grading", icon: BookOpenCheck, badge: "3" },
    { href: "/instructor/courses/new/", label: "New course", icon: PlusCircle },
  ] },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell nav={nav} workspace={{ name: "SkillUp Academy", sub: "Instructor" }} workspaces={["SkillUp Academy", "Grace Chapel International"]} user={{ name: "Natasha Phiri", role: "Instructor" }}>{children}</PortalShell>;
}
