import React, { useState } from 'react';
import { User, Phone, Briefcase, Calendar, AlertTriangle, Save, X } from 'lucide-react';
import { Patient } from '../../types';

interface PatientFormProps {
  onSave: (patient: Omit<Patient, 'id'>) => void;
  onCancel: () => void;
  existingPatient?: Patient;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSave, onCancel, existingPatient }) => {
  const existingMH = existingPatient?.medicalHistory || {};

  const [formData, setFormData] = useState({
    name: existingPatient?.name || '',
    phone: existingPatient?.phone || '',
    age: existingPatient?.age || 0,
    gender: existingPatient?.gender || 'Male' as 'Male' | 'Female',
    occupation: existingPatient?.occupation || '',
    behaviorTag: existingPatient?.behaviorTag || 'Regular' as Patient['behaviorTag'],
    medicalHistory: {
      bloodThinners: existingMH.bloodThinners || false,
      diabetes: existingMH.diabetes || false,
      heartCondition: existingMH.heartCondition || false,
      allergies: existingMH.allergies || '',
      pregnancy: existingMH.pregnancy || false,
      notes: existingMH.notes || '',
    },
    legacyBalance: existingPatient?.legacyBalance || 0,
    totalDue: existingPatient?.totalDue || 0,
  });

  const [showMedicalAlerts, setShowMedicalAlerts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter patient name');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return;
    }
    if (formData.age <= 0) {
      alert('Please enter valid age');
      return;
    }

    onSave(formData);
  };

  const hasRedAlerts = 
    formData.medicalHistory.bloodThinners || 
    formData.medicalHistory.diabetes || 
    formData.medicalHistory.heartCondition || 
    formData.medicalHistory.pregnancy;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-brand-500" size={28} />
          {existingPatient ? 'Edit Patient' : 'New Patient Registration'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase">Basic Information</h3>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Head of Household) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  placeholder="Age"
                  min="1"
                  max="120"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g., Teacher, Engineer, Student"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Behavior Tag */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-gray-700 text-sm uppercase mb-3 flex items-center gap-2">
            <span className="text-amber-600">🏷️</span> Internal Behavior Tag
          </h3>
          <select
            value={formData.behaviorTag}
            onChange={(e) => setFormData({ ...formData, behaviorTag: e.target.value as Patient['behaviorTag'] })}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
          >
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Miser">Miser</option>
            <option value="Difficult">Difficult</option>
            <option value="Con Artist">Con Artist</option>
            <option value="Rich">Rich</option>
            <option value="Poor">Poor</option>
            <option value="Over Sensitive">Over Sensitive</option>
            <option value="Irritating">Irritating</option>
          </select>
          <p className="text-xs text-amber-700 mt-2">
            ⚠️ Confidential: For internal clinic management only
          </p>
        </div>

        {/* Medical Safety Section */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-red-700 text-sm uppercase flex items-center gap-2">
              <AlertTriangle size={18} />
              Medical Red Alerts
            </h3>
            <button
              type="button"
              onClick={() => setShowMedicalAlerts(!showMedicalAlerts)}
              className="text-xs text-red-600 underline"
            >
              {showMedicalAlerts ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showMedicalAlerts && (
            <div className="space-y-3">
              {/* Red Alert Checkboxes */}
              <div className="grid grid-cols-2 gap-3">
                {(['bloodThinners','diabetes','heartCondition','pregnancy'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.medicalHistory[key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        medicalHistory: { ...formData.medicalHistory, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">
                      {key === 'bloodThinners' ? 'Blood Thinners' :
                       key === 'diabetes' ? 'Diabetes' :
                       key === 'heartCondition' ? 'Heart Condition' :
                       'Pregnancy'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Known Allergies
                </label>
                <input
                  type="text"
                  value={formData.medicalHistory.allergies}
                  onChange={(e) => setFormData({
                    ...formData,
                    medicalHistory: { ...formData.medicalHistory, allergies: e.target.value }
                  })}
                  placeholder="e.g., Penicillin, Lidocaine"
                  className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>

              {/* Medical Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Medical Notes
                </label>
                <textarea
                  value={formData.medicalHistory.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    medicalHistory: { ...formData.medicalHistory, notes: e.target.value }
                  })}
                  placeholder="Any other medical conditions or notes..."
                  rows={3}
                  className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>

              {hasRedAlerts && (
                <div className="bg-red-100 p-3 rounded border border-red-300">
                  <p className="text-xs text-red-800 font-semibold">
                    ⚠️ RED ALERT ACTIVE: Exercise caution during treatment
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {existingPatient ? 'Update Patient' : 'Save Patient'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
