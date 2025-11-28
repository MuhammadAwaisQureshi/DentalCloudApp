import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, DollarSign, Settings, LogOut, Activity, Flask, Receipt, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import GAPI, { getConnectionStatus } from './lib/gapi';

// Import all components
import PatientList from './components/patients/PatientList';
import PatientForm from './components/patients/PatientForm';
import AppointmentCalendar from './components/appointments/AppointmentCalendar';
import Waitlist from './components/appointments/Waitlist';
import TreatmentPlan from './components/treatment/TreatmentPlan';
import PrescriptionWriter from './components/prescriptions/PrescriptionWriter';
import Billing from './components/billing/Billing';
import LabTracker from './components/lab/LabTracker';
import OrthoManager from './components/ortho/OrthoManager';
import ExpenseTracker from './components/expenses/ExpenseTracker';
import RevenueDashboard from './components/reports/RevenueDashboard';
import GamificationEngine from './components/gamification/GamificationEngine';

import type { Patient, Appointment } from './types';

type View = 'dashboard' | 'patients' | 'schedule' | 'treatment' | 'prescriptions' | 'billing' | 'lab' | 'ortho' | 'expenses' | 'reports' | 'settings';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clinicId, setClinicId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  // Navigation state
  const [view, setView] = useState<View>('dashboard');

  // Data state (would be loaded from Google Sheets)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();

  // Connection status check
  useEffect(() => {
    const checkStatus = async () => {
      const status = await getConnectionStatus();
      setConnectionStatus(status);
    };

    if (isAuthenticated) {
      checkStatus();
      const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle login
  const handleLogin = async () => {
    if (!clinicId.trim()) {
      alert('Please enter your Clinic ID (Google Sheet ID)');
      return;
    }

    setIsConnecting(true);

    try {
      // Initialize Google Sheets API
     await GAPI.init(clinicId);
      
      // Sign in to Google
      await GAPI.signIn();

      // Test connection
      const connected = await GAPI.checkConnection();
      
      if (connected) {
        setIsAuthenticated(true);
        
        // Load initial data
        await loadDataFromSheets();
      } else {
        throw new Error('Failed to connect to spreadsheet');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message || 'Please check your Clinic ID and try again.'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Load data from Google Sheets
  const loadDataFromSheets = async () => {
    try {
      // Load patients
      const patientsData = await GAPI.loadTable('patients');
      setPatients(patientsData);

      // Load appointments
      const appointmentsData = await GAPI.loadTable('appointments');
      setAppointments(appointmentsData);

      // Load other data as needed...
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await GAPI.signOut();
      setIsAuthenticated(false);
      setClinicId('');
      setPatients([]);
      setAppointments([]);
      setView('dashboard');
    }
  };

  // Save patient
  const handleSavePatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const newPatient: Patient = {
        ...patientData,
        id: `pat_${Date.now()}`,
      };

      // Save to Google Sheets
      await GAPI.appendRow('patients', newPatient);

      // Update local state
      setPatients([...patients, newPatient]);
      setShowPatientForm(false);
      setEditingPatient(undefined);

      alert('Patient saved successfully!');
    } catch (error: any) {
      console.error('Failed to save patient:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-brand-500">
          <div className="text-center mb-8">
            <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🦷</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Abdullah Dental Cloud</h1>
            <p className="text-gray-500 text-sm mt-1">Zero-Cost Cloud SaaS for Dental Clinics</p>
            <p className="text-gray-400 text-xs mt-2">Secure Clinic Login</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Clinic ID (Google Sheet ID)
              </label>
              <input
                type="text"
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                placeholder="Paste your Sheet ID here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                disabled={isConnecting}
              />
              <p className="text-xs text-gray-400 mt-1">
                Example: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={!clinicId.trim() || isConnecting}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                'Sign in with Google'
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by Google Sheets • No Database Required
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 max-w-md">
          <p className="mb-2">© 2025 Abdullah Dental Cloud</p>
          <p>Made with ❤️ in Peshawar, Pakistan</p>
          <p className="mt-2">Dr. Ahmed Abdullah Khan (BDS, MPH) • PMC: 7071-D</p>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Abdullah Dental Care</h2>
            <p className="text-xs text-gray-500">Dr. Ahmed Abdullah Khan • BDS, MPH</p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              {connectionStatus.includes('🟢') ? (
                <Wifi className="text-green-500" size={16} />
              ) : (
                <WifiOff className="text-red-500" size={16} />
              )}
              <span className="hidden sm:inline">{connectionStatus}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Dashboard - Show Gamification */}
        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <GamificationEngine />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Welcome to Abdullah Dental Cloud!</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-brand-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-brand-600">{patients.length}</p>
                  <p className="text-xs text-gray-600">Total Patients</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                  <p className="text-xs text-gray-600">Appointments</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">PKR 0</p>
                  <p className="text-xs text-gray-600">Today's Revenue</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">100%</p>
                  <p className="text-xs text-gray-600">System Health</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients */}
        {view === 'patients' && !showPatientForm && (
          <PatientList
            patients={patients}
            onAddNew={() => setShowPatientForm(true)}
            onEditPatient={(patient) => {
              setEditingPatient(patient);
              setShowPatientForm(true);
            }}
            onSelectPatient={(patient) => console.log('Selected:', patient)}
          />
        )}

        {view === 'patients' && showPatientForm && (
          <PatientForm
            onSave={handleSavePatient}
            onCancel={() => {
              setShowPatientForm(false);
              setEditingPatient(undefined);
            }}
            existingPatient={editingPatient}
          />
        )}

        {/* Schedule */}
        {view === 'schedule' && (
          <div className="space-y-6">
            <AppointmentCalendar
              appointments={appointments}
              patients={patients}
              selectedDate={new Date().toISOString().split('T')[0]}
              onDateChange={(date) => console.log(date)}
              onAddAppointment={(slot) => console.log(slot)}
              onUpdateStatus={(id, status) => console.log(id, status)}
            />
            <Waitlist
              waitlist={[]}
              patients={patients}
              onAddToWaitlist={(entry) => console.log(entry)}
              onRemoveFromWaitlist={(id) => console.log(id)}
              availableSlots={[]}
            />
          </div>
        )}

        {/* Treatment */}
        {view === 'treatment' && (
          <TreatmentPlan
            patientId="demo"
            patientName="Demo Patient"
            exchangeRate={290}
            onSavePlan={(items) => console.log(items)}
          />
        )}

        {/* Prescriptions */}
        {view === 'prescriptions' && patients.length > 0 && (
          <PrescriptionWriter
            patient={patients[0]}
            onSave={(prescription) => console.log(prescription)}
          />
        )}

        {/* Billing */}
        {view === 'billing' && (
          <Billing
            patients={patients}
            completedTreatments={[]}
            onSaveBill={(bill) => console.log(bill)}
          />
        )}

        {/* Lab Work */}
        {view === 'lab' && (
          <LabTracker
            patients={patients}
            onSaveLabItem={(item) => console.log(item)}
          />
        )}

        {/* Orthodontics */}
        {view === 'ortho' && (
          <OrthoManager
            patients={patients}
            onSaveRecord={(record) => console.log(record)}
          />
        )}

        {/* Expenses */}
        {view === 'expenses' && (
          <ExpenseTracker
            onSaveExpense={(expense) => console.log(expense)}
          />
        )}

        {/* Reports */}
        {view === 'reports' && (
          <RevenueDashboard
            todayRevenue={0}
            weekRevenue={0}
            monthRevenue={0}
            pendingTreatments={[]}
            todayTarget={50000}
          />
        )}

        {/* Settings */}
        {view === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value="Abdullah Dental Care"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exchange Rate (USD to PKR)
                </label>
                <input
                  type="number"
                  value="290"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Target (PKR)
                </label>
                <input
                  type="number"
                  value="50000"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 pb-4 shadow-lg overflow-x-auto">
        <NavBtn
          icon={<LayoutDashboard />}
          label="Home"
          active={view === 'dashboard'}
          onClick={() => setView('dashboard')}
        />
        <NavBtn
          icon={<Users />}
          label="Patients"
          active={view === 'patients'}
          onClick={() => setView('patients')}
        />
        <NavBtn
          icon={<Calendar />}
          label="Schedule"
          active={view === 'schedule'}
          onClick={() => setView('schedule')}
        />
        <NavBtn
          icon={<DollarSign />}
          label="Billing"
          active={view === 'billing'}
          onClick={() => setView('billing')}
        />
        <NavBtn
          icon={<Activity />}
          label="Ortho"
          active={view === 'ortho'}
          onClick={() => setView('ortho')}
        />
        <NavBtn
          icon={<Flask />}
          label="Lab"
          active={view === 'lab'}
          onClick={() => setView('lab')}
        />
        <NavBtn
          icon={<Receipt />}
          label="Expenses"
          active={view === 'expenses'}
          onClick={() => setView('expenses')}
        />
        <NavBtn
          icon={<TrendingUp />}
          label="Reports"
          active={view === 'reports'}
          onClick={() => setView('reports')}
        />
        <NavBtn
          icon={<Settings />}
          label="Settings"
          active={view === 'settings'}
          onClick={() => setView('settings')}
        />
      </nav>
    </div>
  );
}

// Navigation Button Component
interface NavBtnProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavBtn: React.FC<NavBtnProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition min-w-[60px] ${
      active ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}
  >
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
