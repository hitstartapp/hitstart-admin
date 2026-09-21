import React from 'react';
import { getUserAnalytics } from './actions';
import { UserKPICards } from './components/UserKPICards';
import { UserGrowthChart } from './components/UserGrowthChart';
import { UserDemographicsCharts } from './components/UserDemographicsCharts';
import { UserFitnessCharts } from './components/UserFitnessCharts';
import { ReportingHeader } from '../components/ReportingHeader';
import { TopUsersTable } from './components/TopUsersTable';

export const dynamic = 'force-dynamic';

export default async function UsersDashboardPage() {
  const analytics = await getUserAnalytics();

  return (
    <>
      <ReportingHeader current="users" />

      {/* KPI Cards */}
      <UserKPICards kpis={analytics.kpis} />

      {/* User Growth Chart */}
      <div className="px-6 mb-6">
        <UserGrowthChart data={analytics.growthData} />
      </div>

      {/* Demographics */}
      <UserDemographicsCharts
        genderData={analytics.genderDistribution}
        dietaryData={analytics.dietaryDistribution}
      />

      {/* Fitness Charts */}
      <UserFitnessCharts
        fitnessGoalData={analytics.fitnessGoalDistribution}
        fitnessLevelData={analytics.fitnessLevelDistribution}
      />

      {/* Top Users Table */}
      <TopUsersTable users={analytics.topUsers} />
    </>
  );
}
