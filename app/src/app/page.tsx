"use client";

import { useState } from "react";
import StudentForm from "@/components/StudentForm";
import ChatInterface from "@/components/ChatInterface";
import UniversityPanel from "@/components/UniversityPanel";
import { StudentProfile, Program } from "@/types";

type AppState = "form" | "chat";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("form");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleFormSubmit = async (studentProfile: StudentProfile) => {
    setProfile(studentProfile);
    setIsLoadingPrograms(true);
    setFilteredPrograms([]);
    setTotalFound(0);
    setSelectedProgram(null);
    setAppState("chat");

    try {
      const res = await fetch("/api/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: studentProfile }),
      });
      const data = await res.json();
      if (data.programs) {
        setFilteredPrograms(data.programs);
        setTotalFound(data.totalFound);
      }
    } catch (e) {
      console.error("Filter error:", e);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const handleBack = () => {
    setAppState("form");
    setProfile(null);
    setFilteredPrograms([]);
    setTotalFound(0);
    setSelectedProgram(null);
  };

  if (appState === "form") {
    return <StudentForm onSubmit={handleFormSubmit} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 z-10 shadow-sm">
        <div className="bg-blue-600 text-white rounded-lg p-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z"
            />
          </svg>
        </div>
        <span className="font-bold text-gray-900">YKS Advisor</span>
        {profile && (
          <span className="text-xs text-gray-500 ml-2">
            {profile.puanTuru}: {profile.puan}
            {profile.sehirTercihi ? ` • ${profile.sehirTercihi}` : ""}
          </span>
        )}
        <div className="ml-auto">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content below top bar */}
      <div className="flex w-full mt-12 h-[calc(100vh-3rem)]">
        {/* Left: Chat panel */}
        <div className="flex-1 min-w-0 border-r border-gray-200 bg-white flex flex-col">
          {profile && (
            <ChatInterface
              profile={profile}
              filteredPrograms={filteredPrograms}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Right: University panel — ALWAYS visible */}
        <div className="w-80 flex-shrink-0 bg-white flex flex-col overflow-hidden">
          <UniversityPanel
            programs={filteredPrograms}
            totalFound={totalFound}
            isLoading={isLoadingPrograms}
            selectedProgram={selectedProgram}
            onSelectProgram={setSelectedProgram}
          />
        </div>
      </div>
    </div>
  );
}
