import React, { useState } from 'react';
import { Pill, AlertTriangle, FileText, Printer, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Patient } from '../../types';
import jsPDF from 'jspdf';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  category: 'Antibiotic' | 'Analgesic' | 'NSAID' | 'Antihistamine' | 'Other';
  contraindications: string[];
}

interface PrescriptionProtocol {
  name: string;
  condition: string;
  tiers: {
    Standard: Medication[];
    Premium: Medication[];
    Basic: Medication[];
  };
  instructions: string[];
}

interface PrescriptionWriterProps {
  patient: Patient;
  onSave: (prescription: any) => void;
}

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({ patient, onSave }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<'Standard' | 'Premium' | 'Basic'>('Standard');
  const [prescriptionItems, setPrescriptionItems] = useState<Medication[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [showSafetyWarnings, setShowSafetyWarnings] = useState(false);

  const PROTOCOLS: PrescriptionProtocol[] = [
    // ... (All your protocols remain unchanged)
  ];

  const checkSafetyWarnings = (medications: Medication[]): string[] => {
    const warnings: string[] = [];
    medications.forEach((med) => {
      const mh = patient.medicalHistory || {};

      if (mh.pregnancy && med.category === 'NSAID') {
        warnings.push(`⛔ CRITICAL: ${med.name} is CONTRAINDICATED in pregnancy. Use Paracetamol instead.`);
      }
      if (mh.bloodThinners && med.category === 'NSAID') {
        warnings.push(`⚠️ WARNING: ${med.name} may increase bleeding risk with blood thinners. Consider alternative.`);
      }
      if (mh.diabetes) {
        warnings.push(`ℹ️ INFO: Patient has diabetes. Monitor healing and adjust as needed.`);
      }
      if (mh.heartCondition) {
        warnings.push(`ℹ️ INFO: Patient has heart condition. Avoid vasoconstrictors if needed.`);
      }
      if (mh.allergies && typeof mh.allergies === 'string' && mh.allergies.toLowerCase().includes('penicillin')) {
        if (med.name.toLowerCase().includes('amoxil') || med.name.toLowerCase().includes('augmentin')) {
          warnings.push(`⛔ CRITICAL: Patient allergic to Penicillin. ${med.name} is CONTRAINDICATED.`);
        }
      }
    });
    return warnings;
  };

  const handleLoadProtocol = () => {
    if (!selectedProtocol) return;

    const protocol = PROTOCOLS.find((p) => p.name === selectedProtocol);
    if (!protocol) return;

    const medications = protocol.tiers[selectedTier] || [];
    setPrescriptionItems(medications);
    setCustomInstructions(protocol.instructions || []);

    const warnings = checkSafetyWarnings(medications);
    setShowSafetyWarnings(warnings.length > 0);
  };

  const generatePDF = () => {
    if (!prescriptionItems || prescriptionItems.length === 0) {
      alert('Please add medications to the prescription');
      return;
    }

    const doc = new jsPDF();
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ABDULLAH DENTAL CARE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Hayatabad Phase 4, Peshawar, Pakistan', 105, 28, { align: 'center' });
    doc.text('Phone: 0300-XXXXXXX', 105, 35, { align: 'center' });
    // Doctor Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Dr. Ahmed Abdullah Khan', 105, 45, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('BDS, MPH', 105, 50, { align: 'center' });
    doc.text('PMC Registration: 7071-D', 105, 55, { align: 'center' });
    doc.line(20, 60, 190, 60); // Separator
    // Patient Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Name:', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(patient.name, 60, 70);
    doc.setFont('helvetica', 'bold');
    doc.text('Age/Gender:', 20, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient.age} years / ${patient.gender}`, 60, 77);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 140, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-GB'), 160, 70);
    // Rx Symbol
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Rx', 20, 92);

    // Medications
    doc.setFontSize(11);
    let yPos = 100;
    prescriptionItems.forEach((med, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.name}`, 25, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`   ${med.dosage} - ${med.frequency}`, 25, yPos);
      yPos += 6;
      doc.text(`   Duration: ${med.duration}`, 25, yPos);
      yPos += 6;
      doc.text(`   ${med.instructions}`, 25, yPos);
      yPos += 10;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Instructions
    if (customInstructions && customInstructions.length > 0) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      customInstructions.forEach((instruction) => {
        doc.text(`• ${instruction}`, 25, yPos);
        yPos += 6;
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This prescription is not valid for court/legal matters.', 105, 285, { align: 'center' });
    doc.line(130, 270, 180, 270);
    doc.setFont('helvetica', 'normal');
    doc.text('Dr. Ahmed Abdullah Khan', 155, 275, { align: 'center' });

    doc.save(`Prescription_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const safetyWarnings = prescriptionItems ? checkSafetyWarnings(prescriptionItems) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Pill className="text-brand-500" size={28} />
              Prescription Writer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Patient: <span className="font-semibold">{patient.name}</span> ({patient.age || 0}y, {patient.gender || 'N/A'})
            </p>
          </div>
        </div>
      </div>

      {/* Medical Alerts */}
      {(patient.medicalHistory?.bloodThinners ||
        patient.medicalHistory?.diabetes ||
        patient.medicalHistory?.heartCondition ||
        patient.medicalHistory?.pregnancy ||
        patient.medicalHistory?.allergies) && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-800 mb-2">MEDICAL ALERTS - REVIEW BEFORE PRESCRIBING</h3>
              <div className="space-y-1 text-sm">
                {patient.medicalHistory?.pregnancy && <p className="text-red-700 font-semibold">⛔ PREGNANCY - Avoid NSAIDs</p>}
                {patient.medicalHistory?.bloodThinners && <p className="text-red-700 font-semibold">⚠️ BLOOD THINNERS - Risk of bleeding</p>}
                {patient.medicalHistory?.diabetes && <p className="text-orange-700 font-semibold">ℹ️ DIABETES - Monitor healing</p>}
                {patient.medicalHistory?.heartCondition && <p className="text-orange-700 font-semibold">ℹ️ HEART CONDITION - Avoid vasoconstrictors</p>}
                {patient.medicalHistory?.allergies && <p className="text-red-700 font-semibold">⛔ ALLERGIES: {patient.medicalHistory.allergies}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Protocol Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-brand-500" size={20} />
              Treatment Protocols
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Protocol</label>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">-- Choose Protocol --</option>
                  {PROTOCOLS.map((protocol) => (
                    <option key={protocol.name} value={protocol.name}>
                      {protocol.name} - {protocol.condition}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProtocol && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Basic', 'Standard', 'Premium'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`py-2 px-3 rounded-lg font-semibold transition ${
                          selectedTier === tier ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLoadProtocol}
                disabled={!selectedProtocol}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Load Protocol
              </button>
            </div>
          </div>
        </div>

        {/* Right: Prescription Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-4">Prescription Preview</h3>

            {safetyWarnings.length > 0 && (
              <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-lg p-3">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Safety Warnings
                </h4>
                <div className="space-y-1">
                  {safetyWarnings.map((warning, index) => (
                    <p key={index} className="text-sm text-red-700">{warning}</p>
                  ))}
                </div>
              </div>
            )}

            {prescriptionItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Pill size={48} className="mx-auto mb-3" />
                <p className="font-medium">No medications selected</p>
                <p className="text-sm mt-1">Load a protocol to begin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptionItems.map((med, index) => (
                  <div key={med.id} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{index + 1}. {med.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{med.dosage} - {med.frequency}</p>
                        <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                        <p className="text-xs text-gray-500 italic mt-1">{med.instructions}</p>
                      </div>
                      <button
                        onClick={() => setPrescriptionItems(prescriptionItems.filter((m) => m.id !== med.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {customInstructions.length > 0 && (
              <div className="mt-4 border-t border-gray-300 pt-4">
                <h4 className="font-bold text-gray-800 mb-2">Instructions:</h4>
                <ul className="space-y-1">
                  {customInstructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-600">• {instruction}</li>
                  ))}
                </ul>
              </div>
            )}

            {prescriptionItems.length > 0 && (
              <button
                onClick={generatePDF}
                className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Generate PDF Prescription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionWriter;
