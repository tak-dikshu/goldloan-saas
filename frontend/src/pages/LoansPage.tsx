import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Scale, IndianRupee, Calendar, Download } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button, Input, Select, Loading, EmptyState, Badge } from '../components/ui';
import { loanAPI, exportAPI } from '../lib/api';
import { LoanWithCustomer } from '../types';
import { formatCurrency, formatWeight, formatDate, getStatusColor, downloadFile } from '../utils/helpers';

export const LoansPage: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanWithCustomer[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [searchTerm, statusFilter, loans]);

  const fetchLoans = async () => {
    try {
      setIsLoading(true);
      const response = await loanAPI.getAll();
      setLoans(response.data);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          loan.loan_number.toLowerCase().includes(term) ||
          loan.customer_name.toLowerCase().includes(term) ||
          loan.customer_phone.includes(term)
      );
    }

    setFilteredLoans(filtered);
  };

  const handleExport = async () => {
    try {
      const response = await exportAPI.exportLoans();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      downloadFile(url, `loans-${Date.now()}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading text="Loading loans..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loans Management</h1>
            <p className="text-gray-600 mt-1">View and manage all gold loans</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={20} className="mr-2" />
              Export
            </Button>
            <Button variant="primary" size="lg" onClick={() => navigate('/loans/create')}>
              <Plus size={20} className="mr-2" />
              New Loan
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by loan number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Loans' },
                { value: 'active', label: 'Active' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredLoans.length} of {loans.length} loans
          </div>
        </Card>

        {/* Loans List */}
        {filteredLoans.length === 0 ? (
          <Card>
            <EmptyState
              message={searchTerm || statusFilter !== 'all' ? 'No loans match your filters' : 'No loans yet'}
              icon={<FileText size={48} className="text-gray-300" />}
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLoans.map((loan) => (
              <Card
                key={loan.id}
                hover
                className="cursor-pointer"
                onClick={() => navigate(`/loans/${loan.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{loan.customer_name}</h3>
                      <Badge variant={loan.status === 'active' ? 'success' : loan.status === 'overdue' ? 'danger' : 'gray'}>
                        {loan.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Loan Number</p>
                        <p className="font-semibold text-gray-900">{loan.loan_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gold Weight</p>
                        <p className="font-semibold text-gray-900 flex items-center">
                          <Scale size={14} className="mr-1" />
                          {formatWeight(loan.net_weight)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Loan Amount</p>
                        <p className="font-semibold text-amber-600 flex items-center">
                          <IndianRupee size={14} className="mr-1" />
                          {formatCurrency(loan.loan_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Balance</p>
                        <p className="font-semibold text-red-600 flex items-center">
                          <IndianRupee size={14} className="mr-1" />
                          {formatCurrency(loan.total_balance)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Start: {formatDate(loan.start_date)}
                      </span>
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Due: {formatDate(loan.due_date)}
                      </span>
                      <span>Interest: {loan.interest_rate}% per month</span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/loans/${loan.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
