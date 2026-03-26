import { isMockMode, supabase } from '../integrations/supabase/client';
import { configMockService } from './config.mock';

export interface PricingConfig {
  precio_noche_base: number;
  precio_noche_alta: number;
  extra_huesped_base: number;
  extra_huesped_alta: number;
  limpieza: number;
  descuento_no_reembolsable: number;
  porcentaje_senal: number;
}

export const configService = {
  async getConfig(): Promise<PricingConfig> {
    if (isMockMode) return configMockService.getConfig();
    const { data, error } = await supabase
      .from('configuracion')
      .select('precio_noche_base,precio_noche_alta,extra_huesped_base,extra_huesped_alta,limpieza,descuento_no_reembolsable,porcentaje_senal')
      .single();
    if (error) throw error;
    return data as PricingConfig;
  },
};
