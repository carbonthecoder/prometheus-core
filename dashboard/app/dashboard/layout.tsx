"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, ShieldCheck, Ticket, BarChart4, FileText, Settings,
  Menu, X, Bell, User, ChevronRight, Star, LogOut, Shield, Bot, Radio, Gift, Coins
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn, isAdmin } from "@/lib/utils";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bellRef.current && !bellRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const config = await api.getAdminConfig();
        setGlobalNotification(config.global_notification);
      } catch (err) {
        // quiet fallback
      }
    };
    fetchNotification();
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white font-mono text-xs">
            ◇
          </div>
          <p className="text-neutral-500 font-mono text-xs">Connecting...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-sm w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-white font-mono text-lg">
            ◇
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-white tracking-tight">Prometheus Core</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sign in with your Discord account to manage your servers, security, and modules.
            </p>
          </div>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/dashboard/guilds" })}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Sign In with Discord</span>
          </button>
          <div className="text-[11px] font-mono text-neutral-600 pt-3 border-t border-white/5">
            Obsidian Noir · Accent #0e0d0d
          </div>
        </div>
      </div>
    );
  }

  const match = pathname.match(/\/dashboard\/guild\/([^\/]+)/);
  const currentGuildId = match ? match[1] : null;

  const allSidebarItems = currentGuildId
    ? [
        { name: "Overview", href: `/dashboard/guild/${currentGuildId}`, icon: LayoutDashboard },
        {
          name: "Security",
          items: [
            { name: "Anti-Nuke", href: `/dashboard/guild/${currentGuildId}/antinuke`, icon: ShieldCheck },
            { name: "Automod", href: `/dashboard/guild/${currentGuildId}/automod`, icon: ShieldCheck },
            { name: "Verification", href: `/dashboard/guild/${currentGuildId}/verification`, icon: Shield },
          ],
        },
        {
          name: "Engagement",
          items: [
            { name: "Welcome", href: `/dashboard/guild/${currentGuildId}/welcome`, icon: Bell },
            { name: "Leveling", href: `/dashboard/guild/${currentGuildId}/leveling`, icon: BarChart4 },
            { name: "Auto Role", href: `/dashboard/guild/${currentGuildId}/autorole`, icon: Bot },
            { name: "Reaction Roles", href: `/dashboard/guild/${currentGuildId}/reactionroles`, icon: Star },
            { name: "Join DM", href: `/dashboard/guild/${currentGuildId}/joindm`, icon: FileText },
            { name: "Invites", href: `/dashboard/guild/${currentGuildId}/invites`, icon: Server },
          ],
        },
        {
          name: "Automation",
          items: [
            { name: "Tickets", href: `/dashboard/guild/${currentGuildId}/tickets`, icon: Ticket },
            { name: "Join to Create", href: `/dashboard/guild/${currentGuildId}/j2c`, icon: Radio },
            { name: "Custom Roles", href: `/dashboard/guild/${currentGuildId}/customroles`, icon: ShieldCheck },
            { name: "Voice Role", href: `/dashboard/guild/${currentGuildId}/invcrole`, icon: Settings },
          ],
        },
        { name: "Settings", href: `/dashboard/guild/${currentGuildId}/settings`, icon: Settings },
        { name: "Back to Servers", href: "/dashboard/guilds", icon: Server },
      ]
    : [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Servers", href: "/dashboard/guilds", icon: Server },
        ...(isAdmin(session?.user?.id) 
            ? [{ name: "Admin Panel", href: "/dashboard/admin", icon: Shield }] 
            : []),
      ];

  let mainSidebarItems = allSidebarItems;
  let backLinkItem: any = null;

  if (currentGuildId) {
    mainSidebarItems = allSidebarItems.filter(
      (item) => !(item.name === "Back to Servers")
    );
    backLinkItem = allSidebarItems.find((item) => item.name === "Back to Servers");
  }

  const BackLinkIcon = backLinkItem?.icon || Server;

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 antialiased selection:bg-neutral-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#000000] border-r border-white/10 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="text-white font-mono text-sm">◇</span>
            <span className="font-semibold text-sm tracking-tight text-white">Prometheus</span>
            <span className="text-[10px] font-mono text-neutral-500 border border-white/10 rounded px-1.5 py-0.2 bg-white/[0.02]">
              core
            </span>
          </Link>
          <button
            className="p-1.5 lg:hidden text-neutral-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {mainSidebarItems.map((item: any) => {
            if (item.items) {
              return (
                <div key={item.name} className="space-y-1">
                  <p className="px-3 text-[11px] font-medium text-neutral-500 mb-2 uppercase tracking-wider font-mono">
                    {item.name}
                  </p>
                  {item.items.map((subItem: any) => {
                    const isActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors font-medium",
                          isActive
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <subItem.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-neutral-500")} />
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors font-medium",
                  isActive
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-neutral-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Servers / Footer Action */}
        {backLinkItem && (
          <div className="p-3 border-t border-white/10">
            <Link
              href={backLinkItem.href || "/dashboard/guilds"}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors font-medium text-xs"
            >
              <BackLinkIcon className="h-4 w-4 text-neutral-500" />
              <span>{backLinkItem.name}</span>
            </Link>
          </div>
        )}

        {/* User Account / Status */}
        <div className="p-3 border-t border-white/10 bg-[#050505]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {session?.user?.name || "Guest Operator"}
                </p>
                <p className="text-[10px] text-neutral-500 truncate font-mono">
                  {session?.user ? "Connected" : "Local Mode"}
                </p>
              </div>
            </div>
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-14 sticky top-0 z-30 bg-[#000000]/80 backdrop-blur border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="p-1.5 lg:hidden text-neutral-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="text-neutral-400">Prometheus</span>
              <span>/</span>
              <span className="text-white">
                {pathname.includes("/guild/") ? "Server Management" : "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Host Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-white/10 text-[11px] font-mono text-neutral-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Self-hosted VPS</span>
            </div>

            {/* User Discord Profile Badge */}
            {session?.user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="h-7 w-7 rounded-full bg-neutral-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                </div>
                <span className="hidden md:inline text-xs font-medium text-white truncate max-w-[120px]">
                  {session.user.name || "Operator"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
