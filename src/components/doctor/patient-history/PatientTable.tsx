
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PatientTableRow from './PatientTableRow';
import { Patient } from '@/types/patient';

interface PatientTableProps {
  patients: Patient[];
  onViewDetails: (patient: Patient) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, onViewDetails }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead className="hidden md:table-cell">Gender</TableHead>
            <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
            <TableHead className="hidden md:table-cell">Blood Group</TableHead>
            <TableHead className="hidden md:table-cell">Last Visit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <PatientTableRow key={patient.customerid} patient={patient} onViewDetails={onViewDetails} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;
