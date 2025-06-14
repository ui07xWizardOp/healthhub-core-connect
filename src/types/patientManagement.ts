
export interface Doctor {
  doctorid: number;
  firstname: string;
  lastname: string;
  specialization: string | null;
}

export interface MedicalRecord {
  record_id: string;
  patient_id: number;
  doctor_id: number;
  record_date: string;
  record_type: 'medical_history' | 'treatment_plan' | 'progress_note' | 'referral';
  title: string;
  content: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PatientReferral {
  referral_id: string;
  record_id: string;
  patient_id: number;
  referring_doctor_id: number;
  referred_to_doctor_id: number | null;
  referred_to_external: string | null;
  specialty: string | null;
  reason: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  referral_date: string;
  appointment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewMedicalRecord = Omit<MedicalRecord, 'record_id' | 'created_at' | 'updated_at'>;
export type NewPatientReferral = Omit<PatientReferral, 'referral_id' | 'created_at' | 'updated_at'>;
