import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Scale,
  IndianRupee,
  Calendar,
  User,
  Phone,
  MapPin,
  Download,
  Plus,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, Button, Loading, Alert, Badge, Modal, Input, Select } from '../components/ui';
import { loanAPI, paymentAPI, pdfAPI } from '../lib/api';
import { Loan, Payment } from '../types';
import { formatCurrency, formatWeight, formatDate, getPurityDisplay } from '../utils/helpers';

export const LoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [message, setMessage] = useState('');

  // Payment form
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_mode: 'cash' as 'cash' | 'upi' | 'bank_transfer' | 'cheque',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLoanDetails();
    }
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      setIsLoading(true);
      const [loanRes, paymentsRes] = await Promise.all([
        loanAPI.getById(parseInt(id!)),
        paymentAPI.getByLoan(parseInt(id!)),
      ]);
      setLoan(loanRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSubmitting(true);
      await paymentAPI.create({
        loan_id: parseInt(id),
        ...paymentData,
      });
      setShowPaymentModal(false);
      setPaymentData({
        amount: 0,
        payment_mode: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setMessage('Payment recorded successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchLoanDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await pdfAPI.generateLoanSanction(parseInt(id!));
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `loan-${loan?.loan_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading text="Loading loan details..." />
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout>
        <Alert type="error" message="Loan not found" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => navigate('/loans')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
              <p className="text-gray-600 mt-1">{loan.loan_number}</p>
            </div>
            <Badge variant={loan.status === 'active' ? 'success' : loan.status === 'overdue' ? 'danger' : 'gray'}>
              {loan.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <Download size={20} className="mr-2" />
              Download PDF
            </Button>
            {loan.status !== 'closed' && (
              <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
                <Plus size={20} className="mr-2" />
                Add Payment
              </Button>
            )}
          </div>
        </div>

        {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(loan.loan_amount)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Balance</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(loan.total_balance)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(loan.total_paid)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Gold Weight</p>
            <p className="text-2xl font-bold text-gray-900">{formatWeight(loan.net_weight)}</p>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer & Gold Info */}
          <Card title="Customer & Gold Details">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ornament Type</p>
                <p className="font-semibold text-gray-900">{loan.ornament_type}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Weight</p>
                  <p className="font-semibold">{formatWeight(loan.gross_weight)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stone Weight</p>
                  <p className="font-semibold">{formatWeight(loan.stone_weight)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Weight</p>
                  <p className="font-semibold text-green-600">{formatWeight(loan.net_weight)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Purity</p>
                  <p className="font-semibold">{getPurityDisplay(loan.purity)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rate per Gram</p>
                  <p className="font-semibold">{formatCurrency(loan.rate_per_gram)}/g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gold Value</p>
                  <p className="font-semibold text-amber-600">{formatCurrency(loan.gold_value)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Loan Terms */}
          <Card title="Loan Terms">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                  <p className="font-semibold">{loan.interest_rate}% per month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tenure</p>
                  <p className="font-semibold">{loan.tenure_days} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold">{formatDate(loan.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="font-semibold">{formatDate(loan.due_date)}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal Balance:</span>
                    <span className="font-semibold">{formatCurrency(loan.principal_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Balance:</span>
                    <span className="font-semibold">{formatCurrency(loan.interest_balance)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Balance:</span>
                    <span className="text-red-600">{formatCurrency(loan.total_balance)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <Card title="Payment History" subtitle={`${payments.length} payment(s)`}>
          {payments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Interest</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Principal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{payment.payment_number}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(payment.payment_date)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(payment.interest_paid)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(payment.principal_paid)}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="gray">{payment.payment_mode.toUpperCase()}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} isLoading={isSubmitting}>
              Record Payment
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          <Alert type="info" message={`Balance to be paid: ${formatCurrency(loan.total_balance)}`} />
          
          <Input
            label="Payment Amount"
            type="number"
            step="1"
            value={paymentData.amount || ''}
            onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
            icon={<IndianRupee size={20} />}
            required
            min="1"
            max={loan.total_balance}
          />

          <Select
            label="Payment Mode"
            value={paymentData.payment_mode}
            onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value as any })}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cheque', label: 'Cheque' },
            ]}
            required
          />

          <Input
            label="Payment Date"
            type="date"
            value={paymentData.payment_date}
            onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
            required
          />

          <Input
            label="Notes (Optional)"
            value={paymentData.notes}
            onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
            placeholder="Any additional notes..."
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};
