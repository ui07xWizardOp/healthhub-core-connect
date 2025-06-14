
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const prescriptionItemSchema = z.object({
  productid: z.string().min(1),
  productName: z.string(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  instructions: z.string().optional(),
});

const prescriptionFormSchema = z.object({
  patient: z.object({
    userid: z.string().min(1, "Patient is required."),
    name: z.string(),
  }),
  notes: z.string().optional(),
  expirydate: z.date().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medication is required."),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

const NewPrescriptionForm: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [patientSearch, setPatientSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patient: { userid: '', name: '' },
      notes: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['search_customers', patientSearch],
    queryFn: async () => {
      if (!patientSearch) return [];
      const { data, error } = await supabase.rpc('search_customers', { p_search_term: patientSearch });
      if (error) throw error;
      return data || [];
    },
    enabled: patientSearch.length > 2,
  });

  const { data: medications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['search_products', medicationSearch],
    queryFn: async () => {
      if (!medicationSearch) return [];
      const { data, error } = await supabase.rpc('search_products', { p_search_term: medicationSearch });
      if (error) throw error;
      return data || [];
    },
    enabled: medicationSearch.length > 2,
  });

  const onSubmit = async (values: PrescriptionFormValues) => {
    if (!userProfile?.doctorId || !userProfile.userid) {
      toast.error("Doctor profile not found. Unable to create prescription.");
      return;
    }

    try {
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          customerid: parseInt(values.patient.userid),
          doctorid: userProfile.doctorId,
          notes: values.notes,
          expirydate: values.expirydate ? format(values.expirydate, 'yyyy-MM-dd') : null,
          createdby: userProfile.userid,
          prescriptiondate: format(new Date(), 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      const prescriptionItems = values.items.map(item => ({
        prescriptionid: prescriptionData.prescriptionid,
        productid: parseInt(item.productid),
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions,
      }));

      const { error: itemsError } = await supabase.from('prescriptionitems').insert(prescriptionItems);
      if (itemsError) throw itemsError;

      toast.success("Prescription created successfully!");
      navigate('/doctor-portal');

    } catch (error: any) {
      toast.error("Failed to create prescription", { description: error.message });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="patient.userid"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Patient</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                          {field.value ? form.getValues("patient.name") : "Select a patient"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search patient by name or email..." onValueChange={setPatientSearch} />
                        <CommandList>
                          {isLoadingPatients && <CommandEmpty>Loading...</CommandEmpty>}
                          <CommandEmpty>No patient found.</CommandEmpty>
                          <CommandGroup>
                            {patients?.map((patient) => (
                              <CommandItem
                                value={`${patient.firstname} ${patient.lastname}`}
                                key={patient.userid}
                                onSelect={() => {
                                  form.setValue("patient.userid", patient.userid.toString());
                                  form.setValue("patient.name", `${patient.firstname} ${patient.lastname}`);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", patient.userid.toString() === field.value ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <p>{patient.firstname} {patient.lastname}</p>
                                  <p className="text-xs text-muted-foreground">{patient.email}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="expirydate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea placeholder="Any additional notes for the prescription..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-md space-y-2 relative">
                  <p className="font-semibold">{item.productName}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField control={form.control} name={`items.${index}.dosage`} render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 1 tab" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`items.${index}.frequency`} render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., TID" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`items.${index}.duration`} render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 7 days" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 21" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`items.${index}.instructions`} render={({ field }) => (<FormItem><FormLabel>Instructions</FormLabel><FormControl><Input placeholder="e.g., Take with food" {...field} /></FormControl></FormItem>)}/>
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            {form.formState.errors.items?.message && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items?.message}</p>}
            
            <div className="mt-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Medication</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search for a medication..." onValueChange={setMedicationSearch} />
                    <CommandList>
                      {isLoadingMedications && <CommandEmpty>Loading...</CommandEmpty>}
                      <CommandEmpty>No medication found.</CommandEmpty>
                      <CommandGroup>
                        {medications?.map((med) => (
                          <CommandItem
                            key={med.productid}
                            onSelect={() => {
                              append({
                                productid: med.productid.toString(),
                                productName: `${med.productname} ${med.strength || ''}`,
                                dosage: '',
                                frequency: '',
                                duration: '',
                                instructions: '',
                              });
                            }}
                          >
                            {med.productname} {med.strength || ''}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Prescription'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewPrescriptionForm;
