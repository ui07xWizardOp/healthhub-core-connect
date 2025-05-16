/**
 * This file contains supplementary type definitions for Supabase tables
 * to improve developer experience when working with the Supabase client.
 */

export interface User {
  userid: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string | null;
  address?: string | null;
  datecreated?: string;
  lastlogin?: string | null;
  isactive?: boolean;
  profile_completed?: boolean;
  profile_picture?: string | null;
}

export interface Product {
  productid: number;
  productname: string;
  genericname?: string | null;
  categoryid?: number | null;
  description?: string | null;
  dosageform?: string | null;
  strength?: string | null;
  unitofmeasure?: string | null;
  requiresprescription?: boolean;
  isactive?: boolean;
  reorderthreshold?: number | null;
  defaulttax?: number | null;
  hsncode?: string | null;
}

export interface BatchInventory {
  batchid: number;
  productid: number | null;
  batchnumber: string;
  manufacturingdate?: string | null;
  expirydate?: string | null;
  quantityinstock?: number | null;
  costprice?: number | null;
  sellingprice?: number | null;
  purchaseorderid?: number | null;
  isactive?: boolean | null;
}

export interface Sale {
  saleid: number;
  customerid?: number | null;
  saledate?: string | null;
  totalamount: number;
  discountamount?: number | null;
  taxamount?: number | null;
  netamount?: number | null;
  prescriptionid?: number | null;
  staffid?: number | null;
  status?: string | null;
  paymentmethod?: string | null;
  transactionreference?: string | null;
}

export interface SaleItem {
  saleitemid: number;
  saleid?: number | null;
  productid?: number | null;
  batchid?: number | null;
  quantity?: number | null;
  unitprice?: number | null;
  discount?: number | null;
  taxpercentage?: number | null;
  taxamount?: number | null;
  totalprice?: number | null;
}

export interface LabOrder {
  orderid: number;
  customerid?: number | null;
  orderdate?: string | null;
  totalamount: number;
  discountamount?: number | null;
  taxamount?: number | null;
  netamount?: number | null;
  createdby?: number | null;
  referredby?: string | null;
  paymentmethod?: string | null;
  transactionreference?: string | null;
  status?: string | null;
  resultdeliverymethod?: string | null;
}

export interface LabOrderItem {
  orderitemid: number;
  orderid?: number | null;
  testid?: number | null;
  panelid?: number | null;
  price: number;
  discount?: number | null;
  taxpercentage?: number | null;
  taxamount?: number | null;
  totalprice?: number | null;
  status?: string | null;
}

export interface TestResult {
  resultid: number;
  orderitemid?: number | null;
  testid?: number | null;
  result?: string | null;
  resultnotes?: string | null;
  testedby?: number | null;
  verifiedby?: number | null;
  testeddatetime?: string | null;
  isabnormal?: boolean | null;
  modifiedby?: number | null;
  lastmodified?: string | null;
}

export interface CustomerProfile {
  customerid: number;
  dateofbirth?: string | null;
  gender?: string | null;
  bloodgroup?: string | null;
  emergencycontact?: string | null;
  insuranceinfo?: string | null;
  medicalhistory?: string | null;
  preferences?: any | null;
}

export interface Appointment {
  appointmentid: number;
  customerid?: number | null;
  doctorid?: number | null;
  appointmentdate: string;
  appointmenttime: string;
  duration?: number | null;
  status?: string | null;
  bookedby?: number | null;
  bookingdatetime?: string | null;
  queuenumber?: number | null;
  notes?: string | null;
  paymentstatus?: string | null;
  paymentamount?: number | null;
  paymentmethod?: string | null;
  transactionreference?: string | null;
}

export interface Doctor {
  doctorid: number;
  userid?: number | null;
  firstname: string;
  lastname: string;
  specialization?: string | null;
  qualification?: string | null;
  registrationnumber?: string | null;
  contactnumber?: string | null;
  email?: string | null;
  consultationfee?: number | null;
  isactive?: boolean | null;
  joiningdate?: string | null;
  profilepicture?: string | null;
  biography?: string | null;
}

export interface LabTest {
  testid: number;
  testname: string;
  categoryid?: number | null;
  description?: string | null;
  price?: number | null;
  turnaroundtime?: number | null;
  sampletype?: string | null;
  testingmethod?: string | null;
  instructions?: string | null;
  malenormalrange?: string | null;
  femalenormalrange?: string | null;
  childnormalrange?: string | null;
  units?: string | null;
  isactive?: boolean | null;
}

export interface AppointmentNotification {
  notification_id: string;
  appointment_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'reminder' | 'cancellation' | 'reschedule' | 'confirmation';
  scheduled_for?: string | null;
  sent_at?: string | null;
  is_read: boolean;
  created_at: string;
}
