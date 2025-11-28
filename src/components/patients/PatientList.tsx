import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Edit2, Phone, Briefcase, User } from 'lucide-react';
import { Patient } from '../../types';

interface PatientListProps {
  patients: Patient[];
  onAddNew: () => void;
  onEditPatient: (patient: Patient) => void;
  onSelectPatient: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  onAddNew, 
  onEditPatient,
  onSelectPatient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Instant filtering by Name or Phone
  const filteredPatients = patients.filter(patient => 
    (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone || '').includes(searchTerm)
  );

  // Helper to get badge color class
  const getBehaviorBadgeClass = (tag: Patient['behaviorTag'] = 'Regular'): string => {
    const tagMap: Record<Patient['behaviorTag'], string> = {
      'Regular': 'tag-regular',
      'VIP': 'tag-vip',
      'Miser': 'tag-miser',
      'Difficult': 'tag-difficult',
      'Con Artist': 'tag-con-artist',
      'Rich': 'tag-rich',
      'Poor': 'tag-poor',
      'Over Sensitive': 'tag-over-sensitive',
      'Irritating': 'tag-irritating',
    };
    return tagMap[tag] || 'tag-regular';
  };

  // Check if patient has red alerts
  const hasRedAlerts = (patient: Patient): boolean => {
    const mh = patient.medicalHistory || {};
    return mh.bloodThinners || mh.diabetes || mh.heartCondition || mh.pregnancy || false;
  };

  // Get red alert summary
  const getRedAlertSummary = (patient: Patient): string => {
    const mh = patient.medicalHistory || {};
    const alerts = [];
    if (mh.bloodThinners) alerts.push('Blood Thinners');
    if (mh.diabetes) alerts.push('Diabetes');
    if (mh.heartCondition) alerts.push('Heart Condition');
    if (mh.pregnancy) alerts.push('Pregnancy');
    return alerts.join(', ');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-brand-500" size={28} />
              Patient Registry
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: {patients.length} patients
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            New Patient
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone number..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-3">
              <User size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm ? 'No patients found' : 'No patients registered yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Click "New Patient" to get started'}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const medicalHistory = patient.medicalHistory || {};
            const totalDue = patient.totalDue || 0;
            const legacyBalance = patient.legacyBalance || 0;
            const age = patient.age || 0;
            const gender = patient.gender || '';
            const behaviorTag = patient.behaviorTag || 'Regular';

            return (
              <div
                key={patient.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => onSelectPatient(patient)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Name with Badge */}
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                          {patient.name}
                        </h3>
                        <span className={`${getBehaviorBadgeClass(behaviorTag)} whitespace-nowrap`}>
                          {behaviorTag}
                        </span>
                        {/* Red Alert Icon */}
                        {hasRedAlerts(patient) && (
                          <div className="group relative">
                            <AlertTriangle 
                              className="text-red-600 animate-pulse" 
                              size={20}
                              title="Medical Red Alert"
                            />
                            <div className="hidden group-hover:block absolute z-10 bg-red-600 text-white text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                              {getRedAlertSummary(patient)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          <span className="font-mono">{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Age:</span>
                          <span className="font-semibold">{age}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Gender:</span>
                          <span>{gender}</span>
                        </div>
                        {patient.occupation && (
                          <div className="flex items-center gap-1">
                            <Briefcase size={14} className="text-gray-400" />
                            <span>{patient.occupation}</span>
                          </div>
                        )}
                      </div>

                      {/* Balance Info */}
                      {(totalDue > 0 || legacyBalance > 0) && (
                        <div className="mt-2 flex gap-4 text-xs">
                          {totalDue > 0 && (
                            <span className="text-red-600 font-semibold">
                              Due: PKR {totalDue.toLocaleString()}
                            </span>
                          )}
                          {legacyBalance > 0 && (
                            <span className="text-orange-600 font-semibold">
                              Legacy: PKR {legacyBalance.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPatient(patient);
                      }}
                      className="text-gray-400 hover:text-brand-500 transition p-2 hover:bg-brand-50 rounded"
                      title="Edit Patient"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  {/* Medical Alerts Detail (if any) */}
                  {hasRedAlerts(patient) && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-800 font-semibold flex items-center gap-2">
                        <AlertTriangle size={14} />
                        MEDICAL ALERTS: {getRedAlertSummary(patient)}
                      </p>
                      {medicalHistory.allergies && (
                        <p className="text-xs text-red-700 mt-1">
                          Allergies: {medicalHistory.allergies}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {patients.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-500">{patients.length}</p>
              <p className="text-xs text-gray-500">Total Patients</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">
                {patients.filter(p => (p.behaviorTag || 'Regular') === 'VIP').length}
              </p>
              <p className="text-xs text-gray-500">VIP Patients</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {patients.filter(p => hasRedAlerts(p)).length}
              </p>
              <p className="text-xs text-gray-500">Red Alerts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {patients.filter(p => (p.totalDue || 0) > 0).length}
              </p>
              <p className="text-xs text-gray-500">Outstanding</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
