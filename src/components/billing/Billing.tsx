import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Percent, FileText, Printer, User, Search } from 'lucide-react';
import { Patient } from '../../types';
import jsPDF from 'jspdf';

interface BillingItem {
  id: string;
  description: string;
  amount: number;
  category: 'Treatment' | 'Manual' | 'Lab';
}

interface BillingProps {
  patients: Patient[];
  completedTreatments: any[]; // Treatments marked as completed
  onSaveBill: (bill: any) => void;
}

const Billing: React.FC<BillingProps> = ({ patients, completedTreatments, onSaveBill }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemAmount, setManualItemAmount] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer'>('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Filter patients by search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  // Load completed treatments for selected patient
  const loadCompletedTreatments = () => {
    if (!selectedPatientId) {
      alert('Please select a patient first');
      return;
    }

    const patientTreatments = completedTreatments
      .filter(t => t.patientId === selectedPatientId && t.status === 'Completed')
      .map(t => ({
        id: `treatment_${t.id}`,
        description: `${t.treatmentName} - Tooth #${Array.isArray(t.toothNumbers) ? t.toothNumbers.join(', ') : t.toothNumbers}`,
        amount: Number(t.costPKR) || 0,
        category: 'Treatment' as const,
      }));

    setBillingItems(prev => [...prev, ...patientTreatments]);
  };

  // Add manual item
  const addManualItem = () => {
    if (!manualItemName || !manualItemAmount) {
      alert('Please enter item name and amount');
      return;
    }

    const amount = parseFloat(manualItemAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newItem: BillingItem = {
      id: `manual_${Date.now()}`,
      description: manualItemName,
      amount,
      category: 'Manual',
    };

    setBillingItems(prev => [...prev, newItem]);
    setManualItemName('');
    setManualItemAmount('');
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setBillingItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate totals
  const subtotal = billingItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  let discountAmount = 0;
  if (discountValue) {
    const discVal = parseFloat(discountValue);
    if (!isNaN(discVal)) {
      if (discountType === 'flat') {
        discountAmount = discVal;
      } else {
        discountAmount = (subtotal * discVal) / 100;
      }
    }
  }

  const total = subtotal - discountAmount;
  const paid = parseFloat(amountPaid) || 0;
  const balance = total - paid;

  // Check if bill contains specific treatments for consent warnings
  const hasImplant = billingItems.some(item => 
    item.description.toLowerCase().includes('implant')
  );
  const hasRCT = billingItems.some(item => 
    item.description.toLowerCase().includes('rct') || 
    item.description.toLowerCase().includes('root canal')
  );

  // Generate PDF Receipt
  const generatePDF = () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    if (billingItems.length === 0) {
      alert('Please add billing items');
      return;
    }

    const doc = new jsPDF();

    // Header
    doc.setFillColor(249, 115, 22); // Brand orange
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ABDULLAH DENTAL CARE', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Hayatabad Phase 4, Peshawar, Pakistan', 105, 22, { align: 'center' });
    doc.text('Dr. Ahmed Abdullah Khan (BDS, MPH) | PMC: 7071-D', 105, 28, { align: 'center' });
    doc.text('Phone: 0334-5822-622', 105, 34, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Receipt Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 105, 50, { align: 'center' });

    // Patient & Bill Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedPatient.name, 60, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 20, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedPatient.phone, 60, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 140, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-GB'), 165, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('Receipt #:', 140, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(`ADC${Date.now().toString().slice(-6)}`, 165, 72);

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 80, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, 85);
    doc.text('Amount (PKR)', 155, 85);

    // Table Items
    let yPos = 95;
    doc.setFont('helvetica', 'normal');
    billingItems.forEach((item) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(item.description, 25, yPos);
      doc.text(item.amount.toLocaleString(), 180, yPos, { align: 'right' });
      yPos += 7;
    });

    // Separator
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 120, yPos);
    doc.text(`PKR ${subtotal.toLocaleString()}`, 180, yPos, { align: 'right' });
    yPos += 7;

    // Discount
    if (discountAmount > 0) {
      doc.text('Discount:', 120, yPos);
      doc.text(`-PKR ${discountAmount.toLocaleString()}`, 180, yPos, { align: 'right' });
      yPos += 7;
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 120, yPos);
    doc.text(`PKR ${total.toLocaleString()}`, 180, yPos, { align: 'right' });
    yPos += 10;

    // Payment Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${paymentMethod}`, 120, yPos);
    yPos += 7;
    doc.text('Amount Paid:', 120, yPos);
    doc.text(`PKR ${paid.toLocaleString()}`, 180, yPos, { align: 'right' });
    yPos += 7;

    if (balance > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Red
      doc.text('Balance Due:', 120, yPos);
      doc.text(`PKR ${balance.toLocaleString()}`, 180, yPos, { align: 'right' });
    } else if (balance < 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74); // Green
      doc.text('Change:', 120, yPos);
      doc.text(`PKR ${Math.abs(balance).toLocaleString()}`, 180, yPos, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74); // Green
      doc.text('PAID IN FULL', 150, yPos, { align: 'center' });
    }

    doc.setTextColor(0, 0, 0); // Reset color
    yPos += 15;

    // Dynamic Consent Warnings
    if (hasImplant || hasRCT) {
      doc.setFillColor(255, 243, 224);
      doc.rect(20, yPos, 170, hasImplant && hasRCT ? 35 : 20, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPORTANT CONSENT NOTICE:', 25, yPos + 5);
      doc.setFont('helvetica', 'normal');
      let consentY = yPos + 11;

      if (hasImplant) {
        doc.text('• Implant: Success rate 95%. Osseointegration required. Follow post-op care.', 25, consentY);
        consentY += 6;
      }
      if (hasRCT) {
        doc.text('• RCT: Crown required within 30 days to prevent fracture. Success rate 85-97%.', 25, consentY);
      }
      yPos += hasImplant && hasRCT ? 40 : 25;
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This receipt is not valid for court/legal matters.', 105, 275, { align: 'center' });
    doc.text('50% deposit required for all lab work before sending to laboratory.', 105, 280, { align: 'center' });
    doc.text('Thank you for choosing Abdullah Dental Care!', 105, 285, { align: 'center' });

    // Signature Line
    doc.line(130, 265, 180, 265);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signature', 155, 270, { align: 'center' });

    // Save PDF
    doc.save(`Receipt_${selectedPatient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-brand-500" size={28} />
          Billing & Invoicing
        </h2>
        <p className="text-sm text-gray-500 mt-1">Generate professional receipts and track payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Patient & Items */}
        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-brand-500" size={20} />
              Select Patient
            </h3>

            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patient..."
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Patient Dropdown */}
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none mb-3"
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>

            {selectedPatient && (
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p><span className="font-semibold">Name:</span> {selectedPatient.name}</p>
                <p><span className="font-semibold">Phone:</span> {selectedPatient.phone}</p>
                <p><span className="font-semibold">Age/Gender:</span> {selectedPatient.age}y / {selectedPatient.gender}</p>
                {selectedPatient.totalDue && selectedPatient.totalDue > 0 && (
                  <p className="text-red-600 font-bold mt-2">
                    Previous Balance: PKR {selectedPatient.totalDue.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={loadCompletedTreatments}
              disabled={!selectedPatientId}
              className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Load Completed Treatments
            </button>
          </div>

          {/* Add Manual Item */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-brand-500" size={20} />
              Add Manual Item
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={manualItemName}
                onChange={(e) => setManualItemName(e.target.value)}
                placeholder="Item description (e.g., Consultation Fee)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <input
                type="number"
                value={manualItemAmount}
                onChange={(e) => setManualItemAmount(e.target.value)}
                placeholder="Amount (PKR)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                onClick={addManualItem}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Summary */}
        <div className="space-y-6">
          {/* Billing Items */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-brand-500" size={20} />
              Bill Items ({billingItems.length})
            </h3>

            {billingItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {billingItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.description}</p>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600 whitespace-nowrap">
                        PKR {item.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount & Payment */}
          {billingItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Percent className="text-brand-500" size={20} />
                Discount & Payment
              </h3>

              <div className="space-y-4">
                {/* Discount Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscountType('flat')}
                    className={`flex-1 py-2 rounded font-semibold transition ${
                      discountType === 'flat'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Flat (Rs)
                  </button>
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 py-2 rounded font-semibold transition ${
                      discountType === 'percentage'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>

                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'flat' ? 'Discount amount (PKR)' : 'Discount percentage (%)'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />

                {/* Payment Method */}
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>

                {/* Amount Paid */}
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Amount paid (PKR)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />

                {/* Summary */}
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-PKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                    <span>Total:</span>
                    <span className="text-brand-600">PKR {total.toLocaleString()}</span>
                  </div>
                  {paid > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Paid:</span>
                        <span className="font-semibold">PKR {paid.toLocaleString()}</span>
                      </div>
                      <div className={`flex justify-between text-base font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        <span>{balance > 0 ? 'Balance Due:' : balance < 0 ? 'Change:' : 'Status:'}</span>
                        <span>{balance > 0 ? `PKR ${balance.toLocaleString()}` : balance < 0 ? `PKR ${Math.abs(balance).toLocaleString()}` : 'PAID'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Generate PDF */}
                <button
                  onClick={generatePDF}
                  className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Generate Receipt (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
