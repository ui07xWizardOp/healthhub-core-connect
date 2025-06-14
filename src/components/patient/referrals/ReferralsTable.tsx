
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, ExternalLink } from 'lucide-react';
import { PatientReferral, Doctor } from '@/types/patientManagement';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralsTableProps {
  referrals: PatientReferral[];
  doctors: Doctor[];
  onViewReferral: (referral: PatientReferral) => void;
}

const ReferralsTable: React.FC<ReferralsTableProps> = ({ referrals, doctors, onViewReferral }) => {
  const { userProfile } = useAuth();
  
  const getDoctorName = (id: number | null) => {
    if (!id) return 'N/A';
    if (id === userProfile?.doctorId) return `${userProfile.firstname} ${userProfile.lastname}`;
    const doctor = doctors.find(d => d.doctorid === id);
    return doctor ? `${doctor.firstname} ${doctor.lastname}` : 'N/A';
  };

  return (
    <div className="mt-4 border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Referred To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral: PatientReferral) => (
            <TableRow key={referral.referral_id}>
              <TableCell className="font-medium">
                {format(new Date(referral.referral_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{referral.specialty}</TableCell>
              <TableCell>
                {referral.referred_to_external ? 
                  <div className="flex items-center">
                    {referral.referred_to_external}
                    <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                  </div> : 
                  `Dr. ${getDoctorName(referral.referred_to_doctor_id)}`}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                  referral.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  referral.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewReferral(referral)}>
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReferralsTable;
