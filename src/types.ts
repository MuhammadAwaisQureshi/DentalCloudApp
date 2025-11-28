export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female';
  occupation?: string;
  behaviorTag: 'Regular' | 'VIP' | 'Miser' | 'Difficult' | 'Con Artist' | 'Rich' | 'Poor' | 'Over Sensitive' | 'Irritating';
  medicalHistory: {
    bloodThinners: boolean;
    diabetes: boolean;
    heartCondition: boolean;
    allergies: string;
    pregnancy: boolean;
    notes: string;
  };
  legacyBalance: number;
  totalDue: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  patientId: string;
  patientName: string;
  type: 'General' | 'Ortho' | 'Surgery';
  status: 'Scheduled' | 'Arrived' | 'Completed' | 'No-Show';
  notes: string;
}

export interface Treatment {
  id: string;
  name: string;
  baseUSD: number;
}

export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  exchangeRate: number;
}
