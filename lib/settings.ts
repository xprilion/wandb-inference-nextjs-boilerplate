export interface WandbSettings {
  apiKey: string;
  project?: string;
}

const SETTINGS_KEY = 'wandb-settings';

export function getWandbSettings(): WandbSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return null;
    
    const settings = JSON.parse(stored) as WandbSettings;
    
    // Validate that all required fields are present
    if (!settings.apiKey) {
      return null;
    }
    
    return settings;
  } catch (error) {
    console.error('Failed to load WandB settings:', error);
    return null;
  }
}

export function saveWandbSettings(settings: WandbSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save WandB settings:', error);
  }
}

export function clearWandbSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear WandB settings:', error);
  }
}

export function validateWandbSettings(settings: Partial<WandbSettings>): string[] {
  const errors: string[] = [];
  
  if (!settings.apiKey?.trim()) {
    errors.push('API Key is required');
  } else if (settings.apiKey.length < 10) {
    errors.push('API Key appears to be invalid (too short)');
  }
  
  // Optional project format check if provided
  if (settings.project && settings.project.trim()) {
    const value = settings.project.trim();
    if (!value.includes('/')) {
      errors.push('Project must be in the format entity_name/project_name');
    }
  }
  
  return errors;
}

export function isWandbConfigured(): boolean {
  const settings = getWandbSettings();
  return settings !== null && validateWandbSettings(settings).length === 0;
}
