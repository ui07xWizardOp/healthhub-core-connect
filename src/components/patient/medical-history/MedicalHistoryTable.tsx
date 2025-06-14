
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { MedicalRecord } from '@/types/patientManagement';

interface MedicalHistoryTableProps {
  records: MedicalRecord[];
  onViewRecord: (record: MedicalRecord) => void;
}

const MedicalHistoryTable: React.FC<MedicalHistoryTableProps> = ({ records, onViewRecord }) => {
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

export default MedicalHistoryTable;
