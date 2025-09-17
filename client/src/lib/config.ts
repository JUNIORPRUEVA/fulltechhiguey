import { useQuery } from "@tanstack/react-query";

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  updatedAt: Date;
}

// Global config cache
let configCache: SiteConfig[] = [];

// Overloaded function to support both signatures for backward compatibility
export function getConfigValue(key: string, defaultValue?: string): string;
export function getConfigValue(configs: SiteConfig[], key: string, defaultValue?: string): string;
export function getConfigValue(
  keyOrConfigs: string | SiteConfig[], 
  keyOrDefaultValue?: string, 
  defaultValue: string = ""
): string {
  // If first parameter is string, use cache-based lookup (legacy)
  if (typeof keyOrConfigs === "string") {
    const key = keyOrConfigs;
    const fallback = keyOrDefaultValue || "";
    const config = configCache.find(c => c.key === key);
    return config?.value || fallback;
  }
  
  // If first parameter is array, use new signature
  const configs = keyOrConfigs as SiteConfig[];
  const key = keyOrDefaultValue as string;
  const config = configs.find(c => c.key === key);
  return config?.value || defaultValue;
}

// Hook to load configs and update cache
export function useConfigLoader() {
  const { data: configs = [] } = useQuery<SiteConfig[]>({
    queryKey: ["/api/site-configs"],
  });

  // Update cache when configs change
  if (configs.length > 0) {
    configCache = configs;
  }

  return configs;
}

// Function to initialize config cache (for components that don't use hooks)
export function initializeConfigCache(configs: SiteConfig[]) {
  configCache = configs;
}