import { isMockMode } from '../integrations/supabase/client';
import { configMockService } from './config.mock';

export const configService = {
  getConfig: async () => {
    if (isMockMode) {
      return configMockService.getConfig();
    }
    return configMockService.getConfig();
  },
  saveConfig: async (config: any) => {
    if (isMockMode) {
      return configMockService.saveConfig(config);
    }
    return configMockService.saveConfig(config);
  }
};
