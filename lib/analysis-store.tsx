"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { analyses as seedAnalyses, skills as seedSkills } from "@/lib/mock-data";
import type { AnalysisRecord, SkillRecord } from "@/lib/types";

type Store = {
  analyses: AnalysisRecord[];
  skills: SkillRecord[];
  upsertAnalysis: (analysis: AnalysisRecord) => void;
  getAnalysis: (id: string) => AnalysisRecord | undefined;
  getSkill: (id: string) => SkillRecord | undefined;
  upsertSkill: (skill: SkillRecord) => void;
};

const AnalysisContext = createContext<Store | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(seedAnalyses);
  const [skills, setSkills] = useState<SkillRecord[]>(seedSkills);

  const upsertAnalysis = useCallback((analysis: AnalysisRecord) => {
    setAnalyses((current) => {
      const index = current.findIndex((item) => item.id === analysis.id);
      if (index === -1) return [analysis, ...current];
      const next = [...current];
      next[index] = analysis;
      return next;
    });
  }, []);

  const upsertSkill = useCallback((skill: SkillRecord) => {
    setSkills((current) => {
      const index = current.findIndex((item) => item.id === skill.id);
      if (index === -1) return [skill, ...current];
      const next = [...current];
      next[index] = skill;
      return next;
    });
  }, []);

  const getAnalysis = useCallback(
    (id: string) => analyses.find((item) => item.id === id),
    [analyses],
  );

  const getSkill = useCallback(
    (id: string) => skills.find((item) => item.id === id),
    [skills],
  );

  const value = useMemo(
    () => ({
      analyses,
      skills,
      upsertAnalysis,
      getAnalysis,
      getSkill,
      upsertSkill,
    }),
    [analyses, skills, upsertAnalysis, getAnalysis, getSkill, upsertSkill],
  );

  return (
    <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
  );
}

export function useAnalysisStore() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysisStore must be used within AnalysisProvider");
  }
  return context;
}
