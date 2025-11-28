import React, { useState } from 'react';
import { Users, Phone, MessageCircle, Plus, X, Trash2, Clock } from 'lucide-react';
import { Patient } from '../../types';

interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  preferredType: 'General' | 'Ortho';
  notes: string;
  addedDate: string;
}

interface WaitlistProps {
  waitlist: WaitlistEntry[];
  patients: Patient[];
  onAddToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'addedDate'>) => void;
  onRemoveFromWaitlist: (entryId: string) => void;
  availableSlots: { time: string; type: 'General' | 'Ortho' }[];
}

const Waitlist: React.FC<WaitlistProps> = ({
  waitlist,
  patients,
  onAddToWaitlist,
  onRemoveFromWaitlist,
  availableSlots,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [preferredType, setPreferredType] = useState<'General' | 'Ortho'>('General');
  const [notes, setNotes] = useState('');

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const generateWhatsAppLink = (entry: WaitlistEntry, slot?: { time: string; type: 'General' | 'Ortho' }): string => {
    const phone = entry.phone?.replace(/\D/g, '') || '';
    const phoneNumber = phone.startsWith('92') ? phone : `92${phone.replace(/^0/, '')}`;

    let message = '';
    if (slot) {
      message = `السلام علیکم ${entry.patientName}،\n\nDr. Ahmed Abdullah Khan has an opening at ${formatTime(slot.time)} for ${slot.type} consultation.\n\nWould you like to book this appointment?\n\nAbdullah Dental Care\nHayatabad, Peshawar\n📞 0300-XXXXXXX`;
    } else {
      message = `السلام علیکم ${entry.patientName}،\n\nYou are on our appointment waitlist for ${entry.preferredType} consultation.\n\nWe will contact you when a slot becomes available.\n\nAbdullah Dental Care`;
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleAddToWaitlist = () => {
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    onAddToWaitlist({
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      preferredType,
      notes,
    });

    setSelectedPatientId('');
    setNotes('');
    setShowAddForm(false);
  };

  const availablePatients = patients.filter(
    p => !waitlist.some(w => w.patientId === p.id)
  );

  const getRelevantSlots = (type: 'General' | 'Ortho') => {
    return availableSlots.filter(slot => slot.type === type);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-brand-500" size={28} />
              Smart Waitlist
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gap Filler • {waitlist?.length || 0} patients waiting
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center gap-2 shadow-md"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? 'Cancel' : 'Add to Waitlist'}
          </button>
        </div>

        {showAddForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {availablePatients?.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredType('General')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      preferredType === 'General'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredType('Ortho')}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      preferredType === 'Ortho'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Ortho
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or preferences..."
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={handleAddToWaitlist}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition"
              >
                Add to Waitlist
              </button>
            </div>
          </div>
        )}
      </div>

      {availableSlots?.length > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-green-600" size={20} />
            <h3 className="font-bold text-green-800">
              {availableSlots.length} Available Slot{availableSlots.length > 1 ? 's' : ''} Today!
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSlots.slice(0, 5).map((slot, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  slot.type === 'General'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-blue-200 text-blue-800'
                }`}
              >
                {formatTime(slot.time)} - {slot.type}
              </span>
            ))}
            {availableSlots.length > 5 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                +{availableSlots.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(!waitlist || waitlist.length === 0) ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Users size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No patients in waitlist
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Add patients here to notify them when slots open up
            </p>
          </div>
        ) : (
          waitlist.map((entry) => {
            const relevantSlots = getRelevantSlots(entry?.preferredType || 'General');

            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {entry.patientName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.preferredType === 'General'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {entry.preferredType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-mono">{entry.phone}</span>
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-600 italic">
                        Note: {entry.notes}
                      </p>
                    )}

                    {relevantSlots.length > 0 && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-800 font-semibold mb-2">
                          ✓ {relevantSlots.length} matching slot{relevantSlots.length > 1 ? 's' : ''} available
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {relevantSlots.slice(0, 3).map((slot, index) => (
                            <a
                              key={index}
                              href={generateWhatsAppLink(entry, slot)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition font-semibold"
                            >
                              <MessageCircle size={12} />
                              {formatTime(slot.time)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:w-auto w-full">
                    <a
                      href={generateWhatsAppLink(entry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                    <button
                      onClick={() => onRemoveFromWaitlist(entry.id)}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {waitlist?.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {waitlist.filter(w => w.preferredType === 'General')?.length || 0}
              </p>
              <p className="text-xs text-gray-500">General Waitlist</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">
                {waitlist.filter(w => w.preferredType === 'Ortho')?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Ortho Waitlist</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Waitlist;
