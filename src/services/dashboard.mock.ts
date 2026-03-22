export interface DashboardStats {
  monthlyRevenue: number;
  upcomingCheckins: number;
  upcomingCheckouts: number;
  pendingReservations: number;
}

export const getMockDashboardStats = async () => {
  return new Promise<DashboardStats>((resolve) => {
    setTimeout(() => {
      resolve({
        monthlyRevenue: 5400,
        upcomingCheckins: 3,
        upcomingCheckouts: 2,
        pendingReservations: 1
      });
    }, 500);
  });
};
