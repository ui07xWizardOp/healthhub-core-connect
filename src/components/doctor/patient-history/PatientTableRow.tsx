
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Patient } from '@/types/patient';

interface PatientTableRowProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({ patient, onViewDetails }) => {
  return (
    <TableRow key={patient.customerid}>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {patient.firstname} {patient.lastname}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {patient.gender || '-'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {patient.dateofbirth
          ? format(new Date(patient.dateofbirth), 'MMM d, yyyy')
          : '-'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {patient.bloodgroup || '-'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {patient.lastvisit
          ? format(new Date(patient.lastvisit), 'MMM d, yyyy')
          : '-'}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(patient)}
        >
          <FileText className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PatientTableRow;
