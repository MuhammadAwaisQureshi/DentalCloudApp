import React, { useState } from 'react';
import { Activity, DollarSign, UserCheck, Calculator, CheckCircle, X } from 'lucide-react';
import { Patient } from '../../types';

interface OrthoRecord {
  id: string;
  patientId: string;
  patientName: string;
  installmentReceived: number;
  materialCost: number;
  visitingDoctorShare: number;
  drAhmedShare: number;
  paymentDate: string;
  settlementStatus: 'Pending' | 'Settled';
  settlementDate?: string;
  notes: string;
}

interface OrthoManagerProps {
  patients: Patient[];
  onSaveRecord: (record: OrthoRecord) => void;
}

const OrthoManager: React.FC<OrthoManagerProps> = ({ patients, onSaveRecord }) => {
  const [orthoRecords, setOrthoRecords] = useState<OrthoRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [installmentReceived, setInstallmentReceived] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate split according to formula: (Installment - Material) / 2
  const calculateSplit = (installment: number, material: number) => {
    const netAmount = installment - material;
    const eachShare = netAmount / 2;
    return {
      visitingDoctorShare: eachShare,
      drAhmedShare: eachShare,
      netAmount,
    };
  };

  // Add new ortho record
  const handleAddRecord = () => {
    if (!selectedPatientId || !installmentReceived) {
      alert('Please select patient and enter installment amount');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const installment = parseFloat(installmentReceived) || 0;
    const material = parseFloat(materialCost) || 0;

    if (installment <= 0) {
      alert('Please enter valid installment amount');
      return;
    }

    const { visitingDoctorShare, drAhmedShare } = calculateSplit(installment, material);

    const newRecord: OrthoRecord = {
      id: `ortho_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      installmentReceived: installment,
      materialCost: material,
      visitingDoctorShare,
      drAhmedShare,
      paymentDate: new Date().toISOString(),
      settlementStatus: 'Pending',
      notes,
    };

    setOrthoRecords([...orthoRecords, newRecord]);
    onSaveRecord(newRecord);

    // Reset form
    setSelectedPatientId('');
    setInstallmentReceived('');
    setMaterialCost('');
    setNotes('');
    setShowAddForm(false);
  };

  // Mark as settled
  const markAsSettled = (recordId: string) => {
    if (confirm('Mark this payment as settled with visiting doctor?')) {
      setOrthoRecords(prev =>
        prev.map(record =>
          record.id === recordId
            ? { ...record, settlementStatus: 'Settled', settlementDate: new Date().toISOString() }
            : record
        )
      );
    }
  };

  // Mark as pending (undo settlement)
  const markAsPending = (recordId: string) => {
    if (confirm('Mark this payment as pending again?')) {
      setOrthoRecords(prev =>
        prev.map(record =>
          record.id === recordId
            ? { ...record, settlementStatus: 'Pending', settlementDate: undefined }
            : record
        )
      );
    }
  };

  // Calculate totals
  const totalPendingToDoctor = orthoRecords
    .filter(r => r.settlementStatus === 'Pending')
    .reduce((sum, r) => sum + r.visitingDoctorShare, 0);

  const totalDrAhmedShare = orthoRecords
    .reduce((sum, r) => sum + r.drAhmedShare, 0);

  const totalSettled = orthoRecords
    .filter(r => r.settlementStatus === 'Settled')
    .reduce((sum, r) => sum + r.visitingDoctorShare, 0);

  // Preview calculation in form
  const previewSplit = installmentReceived && !isNaN(parseFloat(installmentReceived))
    ? calculateSplit(parseFloat(installmentReceived), parseFloat(materialCost) || 0)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity size={28} />
              Orthodontics Revenue Split
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Formula: (Installment - Material Cost) ÷ 2
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
          >
            {showAddForm ? <X size={20} /> : <DollarSign size={20} />}
            {showAddForm ? 'Cancel' : 'New Payment'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending to Doctor</p>
              <p className="text-2xl font-bold text-orange-600">
                PKR {totalPendingToDoctor.toLocaleString()}
              </p>
            </div>
            <UserCheck className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dr. Ahmed's Share</p>
              <p className="text-2xl font-bold text-green-600">
                PKR {totalDrAhmedShare.toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Settled Payments</p>
              <p className="text-2xl font-bold text-gray-600">
                PKR {totalSettled.toLocaleString()}
              </p>
            </div>
            <CheckCircle className="text-gray-500" size={32} />
          </div>
        </div>
      </div>

      {/* Add Payment Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calculator className="text-blue-500" size={20} />
            Record Ortho Payment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select Ortho Patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Installment Received */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Installment Received (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={installmentReceived}
                onChange={(e) => setInstallmentReceived(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Material Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Cost (PKR)
              </label>
              <input
                type="number"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="e.g., 2000 (Optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment details, adjustments, etc..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Live Calculation Preview */}
          {previewSplit && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Calculator size={18} />
                Split Calculation Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Installment Received:</span>
                  <span className="font-semibold">PKR {parseFloat(installmentReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Material Cost:</span>
                  <span className="font-semibold">-PKR {(parseFloat(materialCost) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2">
                  <span className="text-gray-700 font-semibold">Net Amount:</span>
                  <span className="font-bold text-blue-700">PKR {previewSplit.netAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-orange-100 rounded p-2 mt-2">
                  <span className="text-gray-700 font-semibold">Visiting Doctor (50%):</span>
                  <span className="font-bold text-orange-700">PKR {previewSplit.visitingDoctorShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-green-100 rounded p-2">
                  <span className="text-gray-700 font-semibold">Dr. Ahmed (50%):</span>
                  <span className="font-bold text-green-700">PKR {previewSplit.drAhmedShare.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAddRecord}
            className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition"
          >
            Record Payment
          </button>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-gray-800 mb-4">
          Payment Records ({orthoRecords.length})
        </h3>

        {orthoRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Activity size={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium">No ortho payments recorded</p>
            <p className="text-sm mt-1">Click "New Payment" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orthoRecords.map((record) => (
              <div
                key={record.id}
                className={`border-2 rounded-lg p-4 ${
                  record.settlementStatus === 'Settled'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-orange-400 bg-orange-50'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Record Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800">{record.patientName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(record.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.settlementStatus === 'Settled'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-orange-200 text-orange-800'
                        }`}
                      >
                        {record.settlementStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Installment:</span>
                        <span className="font-semibold ml-2">PKR {record.installmentReceived.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Material:</span>
                        <span className="font-semibold ml-2">PKR {record.materialCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700 font-semibold">Visiting Doctor Share:</span>
                        <span className="font-bold text-orange-600">
                          PKR {record.visitingDoctorShare.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-semibold">Dr. Ahmed Share:</span>
                        <span className="font-bold text-green-600">
                          PKR {record.drAhmedShare.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-xs text-gray-600 italic mt-2">
                        Note: {record.notes}
                      </p>
                    )}

                    {record.settlementStatus === 'Settled' && record.settlementDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Settled on: {new Date(record.settlementDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Settlement Action */}
                  <div className="flex lg:flex-col gap-2">
                    {record.settlementStatus === 'Pending' ? (
                      <button
                        onClick={() => markAsSettled(record.id)}
                        className="flex-1 lg:flex-none bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Settle Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsPending(record.id)}
                        className="flex-1 lg:flex-none bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Mark Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      {orthoRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-gray-800 mb-4">This Month's Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Installments Received:</span>
              <span className="font-bold">
                PKR {orthoRecords.reduce((s, r) => s + r.installmentReceived, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Material Costs:</span>
              <span className="font-bold">
                PKR {orthoRecords.reduce((s, r) => s + r.materialCost, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
              <span className="text-gray-600 font-semibold">Net Revenue:</span>
              <span className="font-bold text-blue-600">
                PKR {orthoRecords.reduce((s, r) => s + (r.installmentReceived - r.materialCost), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrthoManager;
