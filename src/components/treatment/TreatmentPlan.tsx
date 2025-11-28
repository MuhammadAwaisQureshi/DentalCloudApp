import React, { useState } from 'react';
import { Plus, Check, X, DollarSign, Calendar, Trash2, Search } from 'lucide-react';
import { TREATMENT_MENU, calculatePKR } from '../../lib/pricing';
import ToothChart from './ToothChart';

interface TreatmentItem {
  id: string;
  toothNumbers: number[];
  treatmentId: string;
  treatmentName: string;
  baseUSD: number;
  costPKR: number;
  status: 'Planned' | 'Completed';
  notes: string;
  dateAdded: string;
  dateCompleted?: string;
}

interface TreatmentPlanProps {
  patientId: string;
  patientName: string;
  exchangeRate: number;
  onSavePlan: (items: TreatmentItem[]) => void;
}

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({
  patientId,
  patientName,
  exchangeRate,
  onSavePlan,
}) => {
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTreatments = TREATMENT_MENU.filter(treatment =>
    treatment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToothToggle = (toothNumber: number) => {
    setSelectedTeeth(prev =>
      prev.includes(toothNumber)
        ? prev.filter(t => t !== toothNumber)
        : [...prev, toothNumber]
    );
  };

  const handleAddTreatment = () => {
    if (selectedTeeth.length === 0) {
      alert('Please select at least one tooth');
      return;
    }
    if (!selectedTreatmentId) {
      alert('Please select a treatment');
      return;
    }

    const treatment = TREATMENT_MENU.find(t => t.id === selectedTreatmentId);
    if (!treatment) return;

    const costPKR = calculatePKR(treatment.baseUSD, exchangeRate);

    const newItem: TreatmentItem = {
      id: `tx_${Date.now()}`,
      toothNumbers: [...selectedTeeth],
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      baseUSD: treatment.baseUSD,
      costPKR,
      status: 'Planned',
      notes,
      dateAdded: new Date().toISOString(),
    };

    setTreatmentItems([...treatmentItems, newItem]);

    setSelectedTeeth([]);
    setSelectedTreatmentId('');
    setNotes('');
    setSearchTerm('');
  };

  const handleStatusToggle = (itemId: string) => {
    setTreatmentItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: item.status === 'Planned' ? 'Completed' : 'Planned',
              dateCompleted: item.status === 'Planned' ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this treatment?')) {
      setTreatmentItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const totalPlanned = treatmentItems
    .filter(item => item.status === 'Planned')
    .reduce((sum, item) => sum + item.costPKR, 0);

  const totalCompleted = treatmentItems
    .filter(item => item.status === 'Completed')
    .reduce((sum, item) => sum + item.costPKR, 0);

  const grandTotal = treatmentItems.reduce((sum, item) => sum + item.costPKR, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🦷</span>
              Treatment Plan
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Patient: <span className="font-semibold">{patientName}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Exchange Rate</p>
            <p className="text-lg font-bold text-brand-500">
              USD 1 = PKR {exchangeRate}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ToothChart
            selectedTeeth={selectedTeeth}
            onToothToggle={handleToothToggle}
          />

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-brand-500" size={20} />
              Add Treatment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Treatment
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search treatments..."
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Procedure
                </label>
                <select
                  value={selectedTreatmentId}
                  onChange={(e) => setSelectedTreatmentId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">-- Choose Treatment --</option>
                  {filteredTreatments.map((treatment) => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.name} - USD {treatment.baseUSD} (PKR {calculatePKR(treatment.baseUSD, exchangeRate)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTreatmentId && (
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                  {(() => {
                    const treatment = TREATMENT_MENU.find(t => t.id === selectedTreatmentId);
                    return treatment ? (
                      <div className="space-y-1">
                        <p className="font-bold text-gray-800">{treatment.name}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Price:</span>
                          <span className="font-semibold">USD {treatment.baseUSD}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cost per Tooth:</span>
                          <span className="font-bold text-brand-600">
                            PKR {calculatePKR(treatment.baseUSD, exchangeRate)}
                          </span>
                        </div>
                        {selectedTeeth.length > 0 && (
                          <div className="flex justify-between text-sm border-t border-brand-300 pt-2 mt-2">
                            <span className="text-gray-600">Total ({selectedTeeth.length} teeth):</span>
                            <span className="font-bold text-brand-700">
                              PKR {(calculatePKR(treatment.baseUSD, exchangeRate) * selectedTeeth.length).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, materials, etc..."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={handleAddTreatment}
                disabled={selectedTeeth.length === 0 || !selectedTreatmentId}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add to Treatment Plan
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-brand-500" size={20} />
              Treatment Schedule
            </h3>

            {treatmentItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg font-medium">No treatments planned yet</p>
                <p className="text-sm mt-2">Select teeth and add treatments to begin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {treatmentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 transition ${
                      item.status === 'Completed'
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.treatmentName}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.toothNumbers.map((tooth) => (
                            <span
                              key={tooth}
                              className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700"
                            >
                              #{tooth}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Completed'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">Cost:</span>
                      <span className="text-lg font-bold text-brand-600">
                        PKR {item.costPKR.toLocaleString()}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-gray-600 mb-3 italic">
                        Note: {item.notes}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusToggle(item.id)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                          item.status === 'Planned'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                      >
                        {item.status === 'Planned' ? (
                          <>
                            <Check size={16} />
                            Mark Complete
                          </>
                        ) : (
                          <>
                            <X size={16} />
                            Mark Planned
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.dateCompleted && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {new Date(item.dateCompleted).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {treatmentItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-brand-500" size={20} />
                Financial Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Planned Treatments:</span>
                  <span className="font-bold text-red-600">
                    PKR {totalPlanned.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Completed Treatments:</span>
                  <span className="font-bold text-green-600">
                    PKR {totalCompleted.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                  <span className="text-base font-semibold text-gray-800">Grand Total:</span>
                  <span className="text-2xl font-bold text-brand-600">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="bg-gray-100 rounded p-2 text-center">
                  <p className="text-xs text-gray-600">
                    {treatmentItems.filter(i => i.status === 'Completed').length} of{' '}
                    {treatmentItems.length} treatments completed
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSavePlan(treatmentItems)}
                className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition"
              >
                Save Treatment Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlan;
