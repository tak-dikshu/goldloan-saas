import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  AlertCircle, 
  IndianRupee,
  Scale,
  Plus,
  Calendar
} from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { StatCard, Card, Button, Loading, EmptyState, Badge } from '../components/ui';
import { dashboardAPI, loanAPI } from '../lib/api';
import { DashboardStats, LoanWithCustomer } from '../types';
import { formatCurrency, formatWeight, formatDate, getStatusColor } from '../utils/helpers';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<LoanWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, loansRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentLoans(5),
      ]);
      setStats(statsRes.data);
      setRecentLoans(loansRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading text="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/loans/create')}
            className="flex items-center"
          >
            <Plus size={20} className="mr-2" />
            New Loan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Loans"
            value={stats?.active_loans || 0}
            icon={<FileText size={24} />}
            color="amber"
            subtitle={`${formatCurrency(stats?.total_loan_amount || 0)} total`}
          />
          
          <StatCard
            title="Total Gold Weight"
            value={formatWeight(stats?.total_gold_weight || 0)}
            icon={<Scale size={24} />}
            color="green"
            subtitle="In custody"
          />
          
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={<Users size={24} />}
            color="blue"
          />
          
          <StatCard
            title="Overdue Loans"
            value={stats?.overdue_loans || 0}
            icon={<AlertCircle size={24} />}
            color="red"
            subtitle="Requires attention"
          />
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Today's Activity">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Loans</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.today_loans || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <IndianRupee className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.today_collections || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <IndianRupee className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Interest Earned</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.total_interest_earned || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Loans */}
          <Card title="Recent Loans" actions={
            <Button variant="secondary" size="sm" onClick={() => navigate('/loans')}>
              View All
            </Button>
          }>
            {recentLoans.length === 0 ? (
              <EmptyState message="No loans yet" icon={<FileText size={48} className="text-gray-300" />} />
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => navigate(`/loans/${loan.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{loan.customer_name}</p>
                        <p className="text-sm text-gray-600">{loan.loan_number}</p>
                      </div>
                      <Badge variant={loan.status === 'active' ? 'success' : loan.status === 'overdue' ? 'danger' : 'gray'}>
                        {loan.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        <Scale size={14} className="inline mr-1" />
                        {formatWeight(loan.net_weight)}
                      </span>
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(loan.loan_amount)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(loan.start_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/loans/create')}
              className="w-full justify-center"
            >
              <Plus size={20} className="mr-2" />
              Create New Loan
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/customers')}
              className="w-full justify-center"
            >
              <Users size={20} className="mr-2" />
              Manage Customers
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/reports')}
              className="w-full justify-center"
            >
              <FileText size={20} className="mr-2" />
              View Reports
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
