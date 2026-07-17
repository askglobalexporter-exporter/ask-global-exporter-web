"use client";

import { createContext, useContext } from "react";
import { defaultCompanySettings, type CompanySettings } from "@/lib/public-content";

const CompanySettingsContext = createContext<CompanySettings>(defaultCompanySettings);

export function CompanySettingsProvider({ settings, children }: { settings: CompanySettings; children: React.ReactNode }) {
  return <CompanySettingsContext.Provider value={settings}>{children}</CompanySettingsContext.Provider>;
}

export function useCompanySettings() {
  return useContext(CompanySettingsContext);
}
