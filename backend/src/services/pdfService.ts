import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Shop, Loan, Customer, Payment } from '../types';
import {
  formatDateIndian,
  formatCurrency,
  formatWeight,
  paiseToRupees,
  timestampToDate,
} from '../utils/calculations';

export class PDFService {
  /**
   * Generate loan sanction letter PDF
   */
  static async generateLoanSanctionLetter(
    shop: Shop,
    loan: Loan,
    customer: Customer
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Generate QR code
        const qrCodeData = `LOAN:${loan.loan_number}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(shop.name, { align: 'center' });

        if (shop.address) {
          doc.fontSize(10).font('Helvetica').text(shop.address, { align: 'center' });
        }

        if (shop.phone) {
          doc.fontSize(10).text(`Phone: ${shop.phone}`, { align: 'center' });
        }

        if (shop.email) {
          doc.fontSize(10).text(`Email: ${shop.email}`, { align: 'center' });
        }

        if (shop.gst_number) {
          doc.fontSize(10).text(`GST: ${shop.gst_number}`, { align: 'center' });
        }

        doc.moveDown();
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown();

        // Title
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('GOLD LOAN SANCTION LETTER', { align: 'center', underline: true });

        doc.moveDown();

        // Loan details
        doc.fontSize(11).font('Helvetica-Bold').text('Loan Details:');
        doc.moveDown(0.5);

        const loanDetails = [
          ['Loan Number:', loan.loan_number],
          ['Date:', formatDateIndian(timestampToDate(loan.start_date))],
          ['Due Date:', formatDateIndian(timestampToDate(loan.due_date))],
          ['Status:', loan.status.toUpperCase()],
        ];

        doc.font('Helvetica');
        loanDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Customer details
        doc.fontSize(11).font('Helvetica-Bold').text('Customer Details:');
        doc.moveDown(0.5);

        const customerDetails = [
          ['Name:', customer.name],
          ['Mobile:', customer.mobile],
          ['Address:', customer.address || 'N/A'],
        ];

        doc.font('Helvetica');
        customerDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Gold details
        doc.fontSize(11).font('Helvetica-Bold').text('Gold Details:');
        doc.moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 200;
        const col3 = 350;
        const col4 = 470;

        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Item', col1, tableTop);
        doc.text('Gross Wt.', col2, tableTop);
        doc.text('Stone Wt.', col3, tableTop);
        doc.text('Net Wt.', col4, tableTop);

        doc
          .moveTo(col1, tableTop + 15)
          .lineTo(550, tableTop + 15)
          .stroke();

        // Table data
        doc.font('Helvetica').fontSize(10);
        const dataTop = tableTop + 20;
        doc.text(loan.ornament_type, col1, dataTop);
        doc.text(formatWeight(loan.gross_weight_grams), col2, dataTop);
        doc.text(formatWeight(loan.stone_weight_grams), col3, dataTop);
        doc.text(formatWeight(loan.net_weight_grams), col4, dataTop);

        doc.moveDown(2);

        const goldDetails = [
          ['Purity:', loan.purity],
          ['Gold Rate:', `${formatCurrency(loan.gold_rate_per_gram)}/gram`],
          ['Gold Value:', formatCurrency(paiseToRupees(loan.gold_value_paise))],
        ];

        goldDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Loan amount details
        doc.fontSize(11).font('Helvetica-Bold').text('Loan Amount Details:');
        doc.moveDown(0.5);

        const amountDetails = [
          ['Principal Amount:', formatCurrency(paiseToRupees(loan.principal_amount_paise))],
          ['Interest Rate:', `${loan.interest_rate_percent}% per month`],
          ['Tenure:', `${loan.tenure_months} months`],
        ];

        doc.font('Helvetica');
        amountDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Outstanding balance
        doc.fontSize(12).font('Helvetica-Bold').text('Outstanding Balance:');
        doc
          .fontSize(14)
          .text(formatCurrency(paiseToRupees(loan.outstanding_principal_paise)), { indent: 20 });

        doc.moveDown(2);

        // QR Code
        doc.image(qrCodeImage, 450, doc.y, { width: 80, height: 80 });

        // Legal disclaimer
        doc.fontSize(8).font('Helvetica-Oblique').text(shop.legal_disclaimer, 50, doc.y, {
          align: 'center',
          width: 400,
        });

        doc.moveDown(3);

        // Signatures
        doc
          .moveTo(50, doc.y)
          .lineTo(250, doc.y)
          .stroke();
        doc
          .moveTo(350, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text('Lender Signature', 50, doc.y, { width: 200, align: 'center' });
        doc.text('Borrower Signature', 350, doc.y, { width: 200, align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate payment receipt PDF
   */
  static async generatePaymentReceipt(
    shop: Shop,
    payment: Payment,
    loan: Loan,
    customer: Customer
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Generate QR code
        const qrCodeData = `PAYMENT:${payment.payment_number}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Header
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(shop.name, { align: 'center' });

        if (shop.address) {
          doc.fontSize(10).font('Helvetica').text(shop.address, { align: 'center' });
        }

        if (shop.phone) {
          doc.fontSize(10).text(`Phone: ${shop.phone}`, { align: 'center' });
        }

        doc.moveDown();
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown();

        // Title
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('PAYMENT RECEIPT', { align: 'center', underline: true });

        doc.moveDown();

        // Receipt details
        doc.fontSize(11).font('Helvetica-Bold').text('Receipt Details:');
        doc.moveDown(0.5);

        const receiptDetails = [
          ['Receipt Number:', payment.payment_number],
          ['Date:', formatDateIndian(timestampToDate(payment.payment_date))],
          ['Payment Mode:', payment.payment_mode.toUpperCase()],
        ];

        if (payment.payment_reference) {
          receiptDetails.push(['Reference:', payment.payment_reference]);
        }

        doc.font('Helvetica');
        receiptDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Customer details
        doc.fontSize(11).font('Helvetica-Bold').text('Customer Details:');
        doc.moveDown(0.5);

        const customerDetails = [
          ['Name:', customer.name],
          ['Mobile:', customer.mobile],
          ['Loan Number:', loan.loan_number],
        ];

        doc.font('Helvetica');
        customerDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Payment breakdown
        doc.fontSize(11).font('Helvetica-Bold').text('Payment Breakdown:');
        doc.moveDown(0.5);

        const paymentDetails = [
          ['Interest Paid:', formatCurrency(paiseToRupees(payment.interest_paid_paise))],
          ['Principal Paid:', formatCurrency(paiseToRupees(payment.principal_paid_paise))],
        ];

        doc.font('Helvetica');
        paymentDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        doc.moveDown();

        // Total amount
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Total Amount Paid:', { continued: true })
          .text(formatCurrency(paiseToRupees(payment.amount_paise)));

        doc.moveDown();

        // Outstanding balance
        doc.fontSize(11).font('Helvetica-Bold').text('Outstanding Balance After Payment:');
        doc.moveDown(0.5);

        const balanceDetails = [
          [
            'Principal:',
            formatCurrency(paiseToRupees(payment.outstanding_principal_after_paise)),
          ],
          [
            'Interest:',
            formatCurrency(paiseToRupees(payment.outstanding_interest_after_paise)),
          ],
        ];

        doc.font('Helvetica');
        balanceDetails.forEach(([label, value]) => {
          doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(value);
          doc.font('Helvetica');
        });

        if (payment.notes) {
          doc.moveDown();
          doc.fontSize(10).font('Helvetica-Oblique').text(`Notes: ${payment.notes}`);
        }

        doc.moveDown(2);

        // QR Code
        doc.image(qrCodeImage, 450, doc.y, { width: 80, height: 80 });

        doc.moveDown(3);

        // Signature
        doc
          .moveTo(350, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica').text('Authorized Signature', 350, doc.y, {
          width: 200,
          align: 'center',
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
