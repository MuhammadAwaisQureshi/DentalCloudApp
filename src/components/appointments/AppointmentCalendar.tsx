import React, { useState } from 'react';
import { Calendar, Clock, Plus, User, Stethoscope, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment, Patient } from '../../types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  patients: Patient[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddAppointment: (slot: { time: string; type: 'General' | 'Ortho' }) => void;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  patients,
  selectedDate,
  onDateChange,
  onAddAppointment,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'General' | 'Ortho'>('General');

  const timeSlots = [
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00'
  ];

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAppointmentForSlot = (time: string): Appointment | undefined => {
    return appointments.find(
      apt => apt.date === selectedDate && apt.time === time && apt.type === viewMode
    );
  };

  const getPatient = (patientId?: string): Patient | undefined => {
    return patients.find(p => p.id === patientId);
  };

  const getStatusColor = (status: Appointment['status'] | undefined): string => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-300',
      'Arrived': 'bg-green-100 text-green-800 border-green-300',
      'Completed': 'bg-gray-100 text-gray-800 border-gray-300',
      'No-Show': 'bg-red-100 text-red-800 border-red-300',
    };
    return status ? colors[status] : '';
  };

  const getStatusIcon = (status: Appointment['status'] | undefined) => {
    switch (status) {
      case 'Scheduled': return <Clock size={14} />;
      case 'Arrived': return <CheckCircle size={14} />;
      case 'Completed': return <CheckCircle size={14} />;
      case 'No-Show': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-brand-500" size={28} />
              Appointment Schedule
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {appointments.filter(a => a.date === selectedDate && a.type === viewMode).length} appointments today
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('General')}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                viewMode === 'General'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <Stethoscope size={18} />
                General
              </span>
            </button>
            <button
              onClick={() => setViewMode('Ortho')}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                viewMode === 'Ortho'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🦷</span>
                Ortho
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timeSlots.map((time) => {
            const appointment = getAppointmentForSlot(time);
            const patient = appointment ? getPatient(appointment.patientId) : undefined;

            return (
              <div
                key={time}
                className={`border-2 rounded-lg p-4 transition ${
                  appointment
                    ? viewMode === 'General'
                      ? 'border-green-400 bg-green-50'
                      : 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="font-bold text-gray-800">{formatTime(time)}</span>
                  </div>
                  {!appointment && (
                    <button
                      onClick={() => onAddAppointment({ time, type: viewMode })}
                      className={`p-1.5 rounded-full transition ${
                        viewMode === 'General'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                      title="Book Appointment"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                {appointment ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {appointment.patientName}
                        </p>
                        {patient && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            patient.behaviorTag === 'VIP'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {patient.behaviorTag}
                          </span>
                        )}
                      </div>
                    </div>

                    {patient && (
                      patient.medicalHistory?.bloodThinners ||
                      patient.medicalHistory?.diabetes ||
                      patient.medicalHistory?.heartCondition ||
                      patient.medicalHistory?.pregnancy
                    ) && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle size={12} />
                        <span className="font-semibold">Medical Alert</span>
                      </div>
                    )}

                    {appointment.notes && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {appointment.notes}
                      </p>
                    )}

                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </div>

                    {appointment.status === 'Scheduled' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onUpdateStatus(appointment.id, 'Arrived')}
                          className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded hover:bg-green-600 transition font-semibold"
                        >
                          Arrived
                        </button>
                        <button
                          onClick={() => onUpdateStatus(appointment.id, 'No-Show')}
                          className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded hover:bg-red-600 transition font-semibold"
                        >
                          No-Show
                        </button>
                      </div>
                    )}

                    {appointment.status === 'Arrived' && (
                      <button
                        onClick={() => onUpdateStatus(appointment.id, 'Completed')}
                        className="w-full bg-gray-700 text-white text-xs py-1.5 rounded hover:bg-gray-800 transition font-semibold"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    Available
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-500">
              {appointments.filter(a => a.date === selectedDate && a.type === viewMode && a.status === 'Scheduled').length}
            </p>
            <p className="text-xs text-gray-500">Scheduled</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {appointments.filter(a => a.date === selectedDate && a.type === viewMode && a.status === 'Arrived').length}
            </p>
            <p className="text-xs text-gray-500">Arrived</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-500">
              {appointments.filter(a => a.date === selectedDate && a.type === viewMode && a.status === 'Completed').length}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">
              {appointments.filter(a => a.date === selectedDate && a.type === viewMode && a.status === 'No-Show').length}
            </p>
            <p className="text-xs text-gray-500">No-Show</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
