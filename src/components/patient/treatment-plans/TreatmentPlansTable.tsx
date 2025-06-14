
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
import { ClipboardList } from 'lucide-react';
import { MedicalRecord } from '@/types/patientManagement';

interface TreatmentPlansTableProps {
  records: MedicalRecord[];
  onViewRecord: (record: MedicalRecord) => void;
}

const TreatmentPlansTable: React.FC<TreatmentPlansTableProps> = ({ records, onViewRecord }) => {
  return (
    <div className="mt-4 border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Content Preview</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record: MedicalRecord) => (
            <TableRow key={record.record_id}>
              <TableCell className="font-medium">
                {format(new Date(record.record_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{record.title}</TableCell>
              <TableCell className="hidden md:table-cell">
                {record.content.length > 100 ? `${record.content.substring(0, 100)}...` : record.content}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewRecord(record)}>
                  <ClipboardList className="h-4 w-4" />
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

export default TreatmentPlansTable;
