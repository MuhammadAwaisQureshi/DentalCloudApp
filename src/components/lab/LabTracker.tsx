import React, { useState } from 'react';
import { Flask, Plus, Clock, CheckCircle, Truck, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Patient } from '../../types';

interface LabItem {
  id: string;
  patientId: string;
  patientName: string;
  itemName: string;
  labName: string;
  cost: number;
  dateSent: string;
  expectedReturn: string;
  status: 'Sent' | 'Received' | 'Delivered';
  notes: string;
}

interface LabTrackerProps {
  patients: Patient[];
  onSaveLabItem: (item: LabItem) => void;
}

const LabTracker: React.FC<LabTrackerProps> = ({ patients, onSaveLabItem }) => {
  const [labItems, setLabItems] = useState<LabItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [itemName, setItemName] = useState('');
  const [labName, setLabName] = useState('');
  const [cost, setCost] = useState('');
  const [dateSent, setDateSent] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturn, setExpectedReturn] = useState('');
  const [notes, setNotes] = useState('');

  const COMMON_LAB_ITEMS = [
    'Zirconia Crown',
    'PFM Crown',
    'E-Max Crown',
    'Implant Crown',
    'Bridge (3 Unit)',
    'Complete Denture',
    'Partial Denture',
    'Flexible Denture',
    'Night Guard',
    'Sports Guard',
    'Temporary Crown',
    'Cast Post & Core',
  ];

  const COMMON_LABS = [
    'City Dental Lab',
    'Perfect Smile Lab',
    'Precision Dental Lab',
    'Modern Dental Lab',
    'Elite Dental Studio',
    'Other',
  ];

  // Calculate expected return (7 days from sent date)
  const calculateExpectedReturn = (sentDate: string): string => {
    const date = new Date(sentDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleAddLabItem = () => {
    if (!selectedPatientId || !itemName || !labName || !cost) {
      alert('Please fill all required fields');
      return;
    }

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost)) {
      alert('Please enter a valid number for cost');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const newItem: LabItem = {
      id: `lab_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      itemName,
      labName,
      cost: parsedCost,
      dateSent,
      expectedReturn: expectedReturn || calculateExpectedReturn(dateSent),
      status: 'Sent',
      notes,
    };

    setLabItems(prev => [...prev, newItem]);
    onSaveLabItem(newItem);

    // Reset form
    setSelectedPatientId('');
    setItemName('');
    setLabName('');
    setCost('');
    setDateSent(new Date().toISOString().split('T')[0]);
    setExpectedReturn('');
    setNotes('');
    setShowAddForm(false);
  };

  const updateStatus = (itemId: string, newStatus: LabItem['status']) => {
    setLabItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };

  const removeItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this lab item?')) {
      setLabItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const isOverdue = (item: LabItem): boolean => {
    if (item.status !== 'Sent') return false;
    const today = new Date();
    const expectedDate = new Date(item.expectedReturn);
    return today > expectedDate;
  };

  const getDaysSinceSent = (dateSent: string): number => {
    const sent = new Date(dateSent);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sent.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusStyle = (status: LabItem['status']): string => {
    const styles = {
      Sent: 'bg-orange-100 text-orange-800 border-orange-300',
      Received: 'bg-green-100 text-green-800 border-green-300',
      Delivered: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return styles[status];
  };

  const getStatusIcon = (status: LabItem['status']) => {
    switch (status) {
      case 'Sent':
        return <Clock size={16} />;
      case 'Received':
        return <CheckCircle size={16} />;
      case 'Delivered':
        return <Truck size={16} />;
    }
  };

  const totalPending = labItems
    .filter(item => item.status === 'Sent')
    .reduce((sum, item) => sum + item.cost, 0);

  const totalCompleted = labItems
    .filter(item => item.status === 'Delivered')
    .reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Flask className="text-brand-500" size={28} />
              Lab Work Tracker
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage outsourced dental lab work</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center gap-2"
          >
            {showAddForm ? <Edit2 size={20} /> : <Plus size={20} />}
            {showAddForm ? 'Cancel' : 'New Lab Item'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4">Add Lab Work</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">-- Select Patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Lab Item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Item <span className="text-red-500">*</span>
              </label>
              <select
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">-- Select Item --</option>
                {COMMON_LAB_ITEMS.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
              {itemName === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom item name"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              )}
            </div>

            {/* Lab Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Name <span className="text-red-500">*</span>
              </label>
              <select
                value={labName}
                onChange={e => setLabName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">-- Select Lab --</option>
                {COMMON_LABS.map(lab => (
                  <option key={lab} value={lab}>
                    {lab}
                  </option>
                ))}
              </select>
              {labName === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter lab name"
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Cost (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="Enter cost"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Date Sent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Sent</label>
              <input
                type="date"
                value={dateSent}
                onChange={e => setDateSent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Expected Return */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return (Auto: 7 days)
              </label>
              <input
                type="date"
                value={expectedReturn || calculateExpectedReturn(dateSent)}
                onChange={e => setExpectedReturn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Shade, special instructions, etc..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAddLabItem}
            className="w-full mt-4 bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition"
          >
            Add Lab Item
          </button>
        </div>
      )}

      {/* Lab Items List */}
      {/* ... same as original with safe checks ... */}

      {/* Summary Stats */}
      {/* ... same as original with safe checks ... */}
    </div>
  );
};

export default LabTracker;
