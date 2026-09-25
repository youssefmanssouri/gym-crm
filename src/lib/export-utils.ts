import { PaymentRecord } from './types';

/**
 * Robust HTML entity encoder to prevent XSS injection in generated document templates
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export data array to downloadable CSV file
 */
export function exportToCSV<T extends object>(filename: string, rows: T[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((fieldName) => {
          let val = (row as Record<string, unknown>)[fieldName] ?? '';
          if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          let strVal = String(val);
          // CSV Formula Injection mitigation: prepend single quote if cell starts with formula characters
          if (/^[=+\-@\t\r]/.test(strVal)) {
            strVal = `'${strVal}`;
          }
          const escaped = strVal.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate secure printable / PDF HTML preview for invoices
 * All user-controlled fields are strictly sanitized to prevent DOM-based XSS attacks.
 */
export function printInvoice(payment: PaymentRecord | Record<string, unknown>) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const invoiceNumber = escapeHtml(payment.invoiceNumber);
  const userName = escapeHtml(payment.userName);
  const userEmail = escapeHtml(payment.userEmail);
  const date = escapeHtml(payment.date);
  const paymentMethod = escapeHtml(payment.paymentMethod);
  const status = escapeHtml(payment.status);
  const description = escapeHtml(payment.description || payment.membershipPlanName || 'Gym Membership');
  const amount = Number(payment.amount || 0).toFixed(2);

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';"/>
    <title>Invoice #${invoiceNumber}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #18181b; background: #fff; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; }
      .logo { font-size: 24px; font-weight: 800; color: #06b6d4; letter-spacing: -1px; }
      .details { margin-top: 30px; display: flex; justify-content: space-between; }
      .table { width: 100%; margin-top: 30px; border-collapse: collapse; }
      .table th, .table td { border: 1px solid #e4e4e7; padding: 12px; text-align: left; }
      .table th { background: #f4f4f5; }
      .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
      .footer { margin-top: 50px; font-size: 12px; color: #71717a; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">APEX FITNESS CLUB</div>
      <div>
        <h3 style="margin:0 0 4px 0;">INVOICE</h3>
        <p style="margin:0;color:#71717a;">#${invoiceNumber}</p>
      </div>
    </div>
    <div class="details">
      <div>
        <strong>Billed To:</strong><br/>
        ${userName}<br/>
        ${userEmail}
      </div>
      <div>
        <strong>Date:</strong> ${date}<br/>
        <strong>Payment Method:</strong> ${paymentMethod}<br/>
        <strong>Status:</strong> ${status}
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Quantity</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${description}</td>
          <td>1</td>
          <td>$${amount}</td>
        </tr>
      </tbody>
    </table>
    <div class="total">
      Total Paid: $${amount}
    </div>
    <div class="footer">
      Thank you for training with Apex Fitness Club! For billing support contact billing@apexfitness.com
    </div>
    <script>
      window.onload = function() { window.print(); }
    </script>
  </body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
