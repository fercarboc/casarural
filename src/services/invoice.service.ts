import { isMockMode } from '../integrations/supabase/client';
import { getMockInvoices } from './invoice.mock';

export const invoiceService = {
  async getInvoices() {
    if (isMockMode) {
      return getMockInvoices();
    }
    // Real implementation placeholder
    return getMockInvoices();
  }
};
