import { isMockMode } from '../integrations/supabase/client';
import { icalMockService } from './ical.mock';

export const icalService = {
  getFeeds: async () => {
    if (isMockMode) {
      return icalMockService.getFeeds();
    }
    return icalMockService.getFeeds();
  },
  syncFeeds: async () => {
    if (isMockMode) {
      return icalMockService.syncFeeds();
    }
    return icalMockService.syncFeeds();
  }
};
