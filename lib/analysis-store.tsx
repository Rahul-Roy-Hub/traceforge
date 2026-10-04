"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { AnalysisRecord, SkillRecord } from "@/lib/types";

const ANALYSES_KEY = "traceforge.analyses";
const SKILLS_KEY = "traceforge.skills";

type Snapshot = {
  analyses: AnalysisRecord[];
  skills: SkillRecord[];
};

const emptySnapshot: Snapshot = { analyses: [], skills: [] };
let snapshot: Snapshot = emptySnapshot;
const listeners = new Set<() => void>();

function readList<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function emit(next: Snapshot) {
  snapshot = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ANALYSES_KEY, JSON.stringify(next.analyses));
    window.localStorage.setItem(SKILLS_KEY, JSON.stringify(next.skills));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return emptySnapshot;
}

if (typeof window !== "undefined") {
  snapshot = {
    analyses: readList<AnalysisRecord>(ANALYSES_KEY),
    skills: readList<SkillRecord>(SKILLS_KEY),
  };
}

type Store = {
  ready: boolean;
  analyses: AnalysisRecord[];
  skills: SkillRecord[];
  upsertAnalysis: (analysis: AnalysisRecord) => void;
  removeAnalysis: (id: string) => void;
  getAnalysis: (id: string) => AnalysisRecord | undefined;
  getSkill: (id: string) => SkillRecord | undefined;
  upsertSkill: (skill: SkillRecord) => void;
};

const AnalysisContext = createContext<Store | null>(null);

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const ready = useIsClient();
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const upsertAnalysis = useCallback((analysis: AnalysisRecord) => {
    const current = snapshot.analyses;
    const index = current.findIndex((item) => item.id === analysis.id);
    const analyses =
      index === -1
        ? [analysis, ...current]
        : current.map((item, itemIndex) =>
            itemIndex === index ? analysis : item,
          );
    emit({ ...snapshot, analyses });
  }, []);

  const removeAnalysis = useCallback((id: string) => {
    emit({
      ...snapshot,
      analyses: snapshot.analyses.filter((item) => item.id !== id),
    });
  }, []);

  const upsertSkill = useCallback((skill: SkillRecord) => {
    const current = snapshot.skills;
    const index = current.findIndex((item) => item.id === skill.id);
    const skills =
      index === -1
        ? [skill, ...current]
        : current.map((item, itemIndex) => (itemIndex === index ? skill : item));
    emit({ ...snapshot, skills });
  }, []);

  const getAnalysis = useCallback(
    (id: string) => data.analyses.find((item) => item.id === id),
    [data.analyses],
  );

  const getSkill = useCallback(
    (id: string) => data.skills.find((item) => item.id === id),
    [data.skills],
  );

  const value = useMemo(
    () => ({
      ready,
      analyses: data.analyses,
      skills: data.skills,
      upsertAnalysis,
      removeAnalysis,
      getAnalysis,
      getSkill,
      upsertSkill,
    }),
    [
      ready,
      data.analyses,
      data.skills,
      upsertAnalysis,
      removeAnalysis,
      getAnalysis,
      getSkill,
      upsertSkill,
    ],
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
