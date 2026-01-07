import React from 'react';
import { Download, FileText, Users, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { exportAPI } from '../lib/api';
import { downloadFile } from '../utils/helpers';

export const ReportsPage: React.FC = () => {
  const handleExport = async (type: string) => {
    try {
      let response;
      let filename;

      switch (type) {
        case 'loans':
          response = await exportAPI.exportLoans();
          filename = `loans-${Date.now()}.csv`;
          break;
        case 'payments':
          response = await exportAPI.exportPayments();
          filename = `payments-${Date.now()}.csv`;
          break;
        case 'customers':
          response = await exportAPI.exportCustomers();
          filename = `customers-${Date.now()}.csv`;
          break;
        case 'dashboard':
          response = await exportAPI.exportDashboard();
          filename = `dashboard-${Date.now()}.csv`;
          break;
        default:
          return;
      }

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      downloadFile(url, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-gray-600 mt-1">Download your business data in CSV format</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <FileText size={32} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loans Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Export all loan details including customer info, gold details, and payment status
                  </p>
                  <Button onClick={() => handleExport('loans')}>
                    <Download size={16} className="mr-2" />
                    Export Loans
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp size={32} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payments Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Export all payment transactions with dates, amounts, and payment modes
                  </p>
                  <Button onClick={() => handleExport('payments')}>
                    <Download size={16} className="mr-2" />
                    Export Payments
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Customers Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Export customer database with contact information and addresses
                  </p>
                  <Button onClick={() => handleExport('customers')}>
                    <Download size={16} className="mr-2" />
                    Export Customers
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText size={32} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Export business summary with statistics and key metrics
                  </p>
                  <Button onClick={() => handleExport('dashboard')}>
                    <Download size={16} className="mr-2" />
                    Export Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Reports</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All reports are exported in CSV format, which can be opened in Excel or Google Sheets</li>
            <li>• Reports include all data up to the current date and time</li>
            <li>• You can filter and analyze the data using spreadsheet applications</li>
            <li>• Regular backups are recommended for data safety</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};
