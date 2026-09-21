import React from 'react';
import { getRevenueAnalytics } from './actions';
import { OverviewCards } from './components/OverviewCards';
import { PurchasesTrendChart } from './components/PurchasesTrendChart';
import { PurchasesPieChart } from './components/PurchasesPieChart';
import { PaymentStatusChart } from './components/PaymentStatusChart';
import { ReportingHeader } from '../components/ReportingHeader';
import { RecentTransactionsTable } from './components/RecentTransactionsTable';

export const dynamic = 'force-dynamic';

export default async function RevenueDashboardPage() {
  const analytics = await getRevenueAnalytics();

  return (
    <>
      <ReportingHeader current="revenue" />

      {/* KPI Cards */}
      <OverviewCards kpis={analytics.kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6 mb-6">
        <div className="lg:col-span-2">
          <PurchasesTrendChart data={analytics.trendData} />
        </div>
        <div className="lg:col-span-1">
          <PurchasesPieChart data={analytics.packageBreakdown} />
        </div>
      </div>

      {/* Payment Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6 mb-6">
        <div className="lg:col-span-1">
          <PaymentStatusChart data={analytics.paymentStatus} />
        </div>
        <div className="lg:col-span-2">
          {/* Spacer for layout balance */}
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsTable transactions={analytics.recentTransactions} />
    </>
  );
}
