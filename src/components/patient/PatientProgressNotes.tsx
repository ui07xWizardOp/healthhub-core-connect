import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, Plus, FileText, Calendar, User } from 'lucide-react';
import PatientSelector from './PatientSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MedicalRecord, NewMedicalRecord } from '@/types/patientManagement';
import ProgressNoteDetailsDialog from './ProgressNoteDetailsDialog';

const PatientProgressNotes: React.FC = () => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<NewMedicalRecord>>({
    record_type: 'progress_note',
    title: '',
    content: ''
  });
  
  // Fetch progress notes for the selected patient
  const { data: progressNotes, isLoading, refetch } = useQuery({
    queryKey: ['patient-progress-notes', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select(`
          record_id,
          patient_id,
          doctor_id,
          record_date,
          record_type,
          title,
          content,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .eq('patient_id', selectedPatientId)
        .eq('record_type', 'progress_note')
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPatientId && !!userProfile?.doctorId
  });

  // Filter records based on search query
  const filteredRecords = progressNotes?.filter(
    (record: MedicalRecord) => {
      return record.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             record.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleCreateRecord = async () => {
    if (!selectedPatientId || !userProfile?.doctorId) {
      toast.error('Please select a patient first');
      return;
    }

    if (!newRecord.title || !newRecord.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('patient_medical_records').insert({
        patient_id: selectedPatientId,
        doctor_id: userProfile.doctorId,
        record_type: 'progress_note',
        title: newRecord.title,
        content: newRecord.content,
        created_by: userProfile.userid
      });

      if (error) throw error;

      toast.success('Progress note created successfully');
      setShowCreateDialog(false);
      setNewRecord({
        record_type: 'progress_note',
        title: '',
        content: ''
      });
      refetch();
    } catch (error: any) {
      console.error('Error creating progress note:', error);
      toast.error(error.message || 'Failed to create progress note');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Patient Progress Notes</CardTitle>
            <CardDescription>Create and manage patient progress notes</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <PatientSelector onPatientSelect={setSelectedPatientId} />
            
            {selectedPatientId && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search progress notes"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {isLoading && selectedPatientId ? (
            <div className="mt-4 animate-pulse">
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full mb-4 rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
            </div>
          ) : selectedPatientId && filteredRecords && filteredRecords.length > 0 ? (
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
                  {filteredRecords.map((record: MedicalRecord) => (
                    <TableRow key={record.record_id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.record_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{record.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.content.length > 100 ? `${record.content.substring(0, 100)}...` : record.content}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setViewingRecord(record)}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : selectedPatientId ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No progress notes</h3>
              <p className="text-gray-500 mb-4">This patient doesn't have any progress notes yet.</p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Progress Note</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a patient</h3>
              <p className="text-gray-500">Please select a patient to view their progress notes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {viewingRecord && (
        <ProgressNoteDetailsDialog 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Progress Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Title of progress note"
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                placeholder="Detailed progress note information"
                className="min-h-[150px]"
                value={newRecord.content}
                onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateRecord}>Create Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProgressNotes;
