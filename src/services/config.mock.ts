export const MOCK_CONFIG = {
  basePrice: 120,
  highSeasonPrice: 180,
  extraGuestPrice: 25,
  cleaningFee: 60,
  minStay: 2,
  maxGuests: 11,
  policies: {
    immediateBooking: true,
    identityVerification: true,
    petsAllowed: false
  }
};

export const configMockService = {
  getConfig: async () => {
    const saved = localStorage.getItem('mock_config');
    if (saved) return JSON.parse(saved);
    return MOCK_CONFIG;
  },
  saveConfig: async (config: any) => {
    localStorage.setItem('mock_config', JSON.stringify(config));
    return config;
  }
};
