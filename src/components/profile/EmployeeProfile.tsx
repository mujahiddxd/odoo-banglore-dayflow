"use client";

import { useState, useEffect } from "react";
import type { AuthUser, FullEmployeeProfile, ComputedSalary, SalaryConfig } from "@/lib/types";
import { ProfileHeader } from "./ProfileHeader";
import { ResumeTab } from "./tabs/ResumeTab";
import { PrivateInfoTab } from "./tabs/PrivateInfoTab";
import { SalaryInfoTab } from "./tabs/SalaryInfoTab";
import { SecurityTab } from "./tabs/SecurityTab";

interface EmployeeProfileProps {
  employeeId: string;
  currentUser: AuthUser;
}

type TabId = "resume" | "private" | "salary" | "security";

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

export function EmployeeProfile({
  employeeId,
  currentUser,
}: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState<TabId>("resume");
  const [profile, setProfile] = useState<FullEmployeeProfile | null>(null);
  const [salary, setSalary] = useState<{
    config: SalaryConfig;
    computed: ComputedSalary;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser.employeeId === employeeId;
  const isAdmin = currentUser.role === "ADMIN";
  const canViewSalary = isOwnProfile || isAdmin;

  // Build tabs list — salary only if authorized
  const tabs: TabDef[] = [
    { id: "resume", label: "Resume", icon: "📄" },
    { id: "private", label: "Private Info", icon: "🔒" },
    ...(canViewSalary
      ? [{ id: "salary" as TabId, label: "Salary Info", icon: "💰" }]
      : []),
    { id: "security", label: "Security", icon: "🛡️" },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const profileRes = await fetch(`/api/employees/${employeeId}`);
        if (!profileRes.ok) {
          if (profileRes.status === 403) {
            setError("You don't have permission to view this profile.");
            return;
          }
          throw new Error("Failed to load profile");
        }
        const profileData = await profileRes.json();
        setProfile(profileData.data);

        // Fetch salary if authorized
        if (canViewSalary) {
          const salaryRes = await fetch(
            `/api/employees/${employeeId}/salary`
          );
          if (salaryRes.ok) {
            const salaryData = await salaryRes.json();
            setSalary(salaryData.data);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [employeeId, canViewSalary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="font-headline text-2xl mb-2">Loading...</div>
          <p className="font-hand text-lg opacity-60">
            Fetching profile data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="sketchy-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="font-headline text-2xl mb-2">Access Denied</h2>
          <p className="font-body text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="animate-fade-in">
      {/* Page title showing whose profile this is */}
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">
          {isOwnProfile ? "My Profile" : `${profile.employee.name}'s Profile`}
        </h1>
        {!isOwnProfile && (
          <p className="font-body text-sm opacity-60 mt-1">
            Viewing as Admin
          </p>
        )}
      </div>

      {/* Profile Header */}
      <ProfileHeader employee={profile.employee} />

      {/* Tabs */}
      <div className="sketchy-tabs mt-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sketchy-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "resume" && (
          <ResumeTab
            resume={profile.resume}
            education={profile.education}
            profileInfo={profile.profileInfo}
          />
        )}

        {activeTab === "private" && (
          <PrivateInfoTab
            privateInfo={profile.privateInfo}
            bankDetails={profile.bankDetails}
            companyIdentifiers={profile.companyIdentifiers}
            profileInfo={profile.profileInfo}
            canEdit={isOwnProfile || isAdmin}
          />
        )}

        {activeTab === "salary" && canViewSalary && salary && (
          <SalaryInfoTab
            salary={salary}
            employeeId={employeeId}
            canEdit={isAdmin}
            currentUser={currentUser}
            onSalaryUpdate={(newSalary) => setSalary(newSalary)}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            employee={profile.employee}
            isOwnProfile={isOwnProfile}
          />
        )}
      </div>
    </div>
  );
}
