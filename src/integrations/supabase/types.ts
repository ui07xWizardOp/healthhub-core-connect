export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointment_notifications: {
        Row: {
          appointment_id: number | null
          created_at: string | null
          is_read: boolean | null
          message: string
          notification_id: string
          notification_type: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: number | null
        }
        Insert: {
          appointment_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          message: string
          notification_id?: string
          notification_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id?: number | null
        }
        Update: {
          appointment_id?: number | null
          created_at?: string | null
          is_read?: boolean | null
          message?: string
          notification_id?: string
          notification_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointmentid"]
          },
          {
            foreignKeyName: "appointment_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      appointments: {
        Row: {
          appointmentdate: string
          appointmentid: number
          appointmenttime: string
          bookedby: number | null
          bookingdatetime: string | null
          customerid: number | null
          doctorid: number | null
          duration: number | null
          notes: string | null
          paymentamount: number | null
          paymentmethod: string | null
          paymentstatus: string | null
          queuenumber: number | null
          status: string | null
          transactionreference: string | null
        }
        Insert: {
          appointmentdate: string
          appointmentid?: number
          appointmenttime: string
          bookedby?: number | null
          bookingdatetime?: string | null
          customerid?: number | null
          doctorid?: number | null
          duration?: number | null
          notes?: string | null
          paymentamount?: number | null
          paymentmethod?: string | null
          paymentstatus?: string | null
          queuenumber?: number | null
          status?: string | null
          transactionreference?: string | null
        }
        Update: {
          appointmentdate?: string
          appointmentid?: number
          appointmenttime?: string
          bookedby?: number | null
          bookingdatetime?: string | null
          customerid?: number | null
          doctorid?: number | null
          duration?: number | null
          notes?: string | null
          paymentamount?: number | null
          paymentmethod?: string | null
          paymentstatus?: string | null
          queuenumber?: number | null
          status?: string | null
          transactionreference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_bookedby_fkey"
            columns: ["bookedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "appointments_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customerprofiles"
            referencedColumns: ["customerid"]
          },
          {
            foreignKeyName: "appointments_doctorid_fkey"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctorid"]
          },
        ]
      }
      auditlog: {
        Row: {
          action: string
          actiondatetime: string | null
          ipaddress: string | null
          logid: number
          newvalue: string | null
          oldvalue: string | null
          recordid: number | null
          tableaffected: string | null
          userid: number | null
        }
        Insert: {
          action: string
          actiondatetime?: string | null
          ipaddress?: string | null
          logid?: number
          newvalue?: string | null
          oldvalue?: string | null
          recordid?: number | null
          tableaffected?: string | null
          userid?: number | null
        }
        Update: {
          action?: string
          actiondatetime?: string | null
          ipaddress?: string | null
          logid?: number
          newvalue?: string | null
          oldvalue?: string | null
          recordid?: number | null
          tableaffected?: string | null
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auditlog_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      batchinventory: {
        Row: {
          batchid: number
          batchnumber: string
          costprice: number | null
          expirydate: string | null
          isactive: boolean | null
          manufacturingdate: string | null
          productid: number | null
          purchaseorderid: number | null
          quantityinstock: number | null
          sellingprice: number | null
        }
        Insert: {
          batchid?: number
          batchnumber: string
          costprice?: number | null
          expirydate?: string | null
          isactive?: boolean | null
          manufacturingdate?: string | null
          productid?: number | null
          purchaseorderid?: number | null
          quantityinstock?: number | null
          sellingprice?: number | null
        }
        Update: {
          batchid?: number
          batchnumber?: string
          costprice?: number | null
          expirydate?: string | null
          isactive?: boolean | null
          manufacturingdate?: string | null
          productid?: number | null
          purchaseorderid?: number | null
          quantityinstock?: number | null
          sellingprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batchinventory_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "batchinventory_purchaseorderid_fkey"
            columns: ["purchaseorderid"]
            isOneToOne: false
            referencedRelation: "purchaseorders"
            referencedColumns: ["purchaseorderid"]
          },
        ]
      }
      categories: {
        Row: {
          categoryid: number
          categoryname: string
          description: string | null
        }
        Insert: {
          categoryid?: number
          categoryname: string
          description?: string | null
        }
        Update: {
          categoryid?: number
          categoryname?: string
          description?: string | null
        }
        Relationships: []
      }
      customerprofiles: {
        Row: {
          bloodgroup: string | null
          customerid: number
          dateofbirth: string | null
          emergencycontact: string | null
          gender: string | null
          insuranceinfo: string | null
          medicalhistory: string | null
          preferences: Json | null
        }
        Insert: {
          bloodgroup?: string | null
          customerid: number
          dateofbirth?: string | null
          emergencycontact?: string | null
          gender?: string | null
          insuranceinfo?: string | null
          medicalhistory?: string | null
          preferences?: Json | null
        }
        Update: {
          bloodgroup?: string | null
          customerid?: number
          dateofbirth?: string | null
          emergencycontact?: string | null
          gender?: string | null
          insuranceinfo?: string | null
          medicalhistory?: string | null
          preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "customerprofiles_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      customerstats: {
        Row: {
          averagespend: number | null
          date: string
          newcustomers: number | null
          returningcustomers: number | null
          statid: number
          testvssaleratio: number | null
          topspender: string | null
          totalcustomers: number
        }
        Insert: {
          averagespend?: number | null
          date: string
          newcustomers?: number | null
          returningcustomers?: number | null
          statid?: number
          testvssaleratio?: number | null
          topspender?: string | null
          totalcustomers: number
        }
        Update: {
          averagespend?: number | null
          date?: string
          newcustomers?: number | null
          returningcustomers?: number | null
          statid?: number
          testvssaleratio?: number | null
          topspender?: string | null
          totalcustomers?: number
        }
        Relationships: []
      }
      dailyclosing: {
        Row: {
          cashreceived: number
          closedby: number | null
          closingcash: number
          closingdate: string
          closingid: number
          discrepancyamount: number | null
          notes: string | null
          onlinepayments: number | null
          openingcash: number
          totaldiscounts: number | null
          totalreturns: number | null
          totalsales: number
          totaltax: number | null
        }
        Insert: {
          cashreceived: number
          closedby?: number | null
          closingcash: number
          closingdate: string
          closingid?: number
          discrepancyamount?: number | null
          notes?: string | null
          onlinepayments?: number | null
          openingcash: number
          totaldiscounts?: number | null
          totalreturns?: number | null
          totalsales: number
          totaltax?: number | null
        }
        Update: {
          cashreceived?: number
          closedby?: number | null
          closingcash?: number
          closingdate?: string
          closingid?: number
          discrepancyamount?: number | null
          notes?: string | null
          onlinepayments?: number | null
          openingcash?: number
          totaldiscounts?: number | null
          totalreturns?: number | null
          totalsales?: number
          totaltax?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dailyclosing_closedby_fkey"
            columns: ["closedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      discounts: {
        Row: {
          applicableproducts: string | null
          discountid: number
          discountname: string
          discounttype: string | null
          discountvalue: number
          enddate: string
          isactive: boolean | null
          maxdiscountamount: number | null
          minpurchaseamount: number | null
          startdate: string
        }
        Insert: {
          applicableproducts?: string | null
          discountid?: number
          discountname: string
          discounttype?: string | null
          discountvalue: number
          enddate: string
          isactive?: boolean | null
          maxdiscountamount?: number | null
          minpurchaseamount?: number | null
          startdate: string
        }
        Update: {
          applicableproducts?: string | null
          discountid?: number
          discountname?: string
          discounttype?: string | null
          discountvalue?: number
          enddate?: string
          isactive?: boolean | null
          maxdiscountamount?: number | null
          minpurchaseamount?: number | null
          startdate?: string
        }
        Relationships: []
      }
      doctorleaves: {
        Row: {
          doctorid: number | null
          enddate: string
          leaveid: number
          reason: string | null
          startdate: string
          status: string | null
        }
        Insert: {
          doctorid?: number | null
          enddate: string
          leaveid?: number
          reason?: string | null
          startdate: string
          status?: string | null
        }
        Update: {
          doctorid?: number | null
          enddate?: string
          leaveid?: number
          reason?: string | null
          startdate?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctorleaves_doctorid_fkey"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctorid"]
          },
        ]
      }
      doctors: {
        Row: {
          biography: string | null
          consultationfee: number | null
          contactnumber: string | null
          doctorid: number
          email: string | null
          firstname: string
          isactive: boolean | null
          joiningdate: string | null
          lastname: string
          profilepicture: string | null
          qualification: string | null
          registrationnumber: string | null
          specialization: string | null
          userid: number | null
        }
        Insert: {
          biography?: string | null
          consultationfee?: number | null
          contactnumber?: string | null
          doctorid?: number
          email?: string | null
          firstname: string
          isactive?: boolean | null
          joiningdate?: string | null
          lastname: string
          profilepicture?: string | null
          qualification?: string | null
          registrationnumber?: string | null
          specialization?: string | null
          userid?: number | null
        }
        Update: {
          biography?: string | null
          consultationfee?: number | null
          contactnumber?: string | null
          doctorid?: number
          email?: string | null
          firstname?: string
          isactive?: boolean | null
          joiningdate?: string | null
          lastname?: string
          profilepicture?: string | null
          qualification?: string | null
          registrationnumber?: string | null
          specialization?: string | null
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      doctorschedule: {
        Row: {
          dayofweek: number | null
          doctorid: number | null
          endtime: string
          isactive: boolean | null
          maxappointments: number | null
          scheduleid: number
          starttime: string
        }
        Insert: {
          dayofweek?: number | null
          doctorid?: number | null
          endtime: string
          isactive?: boolean | null
          maxappointments?: number | null
          scheduleid?: number
          starttime: string
        }
        Update: {
          dayofweek?: number | null
          doctorid?: number | null
          endtime?: string
          isactive?: boolean | null
          maxappointments?: number | null
          scheduleid?: number
          starttime?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctorschedule_doctorid_fkey"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctorid"]
          },
        ]
      }
      inventorystats: {
        Row: {
          date: string
          expiringsoon: number | null
          fastmoving: number | null
          outofstock: number | null
          slowmoving: number | null
          statid: number
          totalproducts: number
          totalstock: number
          totalstockvalue: number
        }
        Insert: {
          date: string
          expiringsoon?: number | null
          fastmoving?: number | null
          outofstock?: number | null
          slowmoving?: number | null
          statid?: number
          totalproducts: number
          totalstock: number
          totalstockvalue: number
        }
        Update: {
          date?: string
          expiringsoon?: number | null
          fastmoving?: number | null
          outofstock?: number | null
          slowmoving?: number | null
          statid?: number
          totalproducts?: number
          totalstock?: number
          totalstockvalue?: number
        }
        Relationships: []
      }
      laborderitems: {
        Row: {
          discount: number | null
          orderid: number | null
          orderitemid: number
          panelid: number | null
          price: number
          status: string | null
          taxamount: number | null
          taxpercentage: number | null
          testid: number | null
          totalprice: number | null
        }
        Insert: {
          discount?: number | null
          orderid?: number | null
          orderitemid?: number
          panelid?: number | null
          price: number
          status?: string | null
          taxamount?: number | null
          taxpercentage?: number | null
          testid?: number | null
          totalprice?: number | null
        }
        Update: {
          discount?: number | null
          orderid?: number | null
          orderitemid?: number
          panelid?: number | null
          price?: number
          status?: string | null
          taxamount?: number | null
          taxpercentage?: number | null
          testid?: number | null
          totalprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "laborderitems_orderid_fkey"
            columns: ["orderid"]
            isOneToOne: false
            referencedRelation: "laborders"
            referencedColumns: ["orderid"]
          },
          {
            foreignKeyName: "laborderitems_panelid_fkey"
            columns: ["panelid"]
            isOneToOne: false
            referencedRelation: "testpanels"
            referencedColumns: ["panelid"]
          },
          {
            foreignKeyName: "laborderitems_testid_fkey"
            columns: ["testid"]
            isOneToOne: false
            referencedRelation: "labtests"
            referencedColumns: ["testid"]
          },
        ]
      }
      laborders: {
        Row: {
          createdby: number | null
          customerid: number | null
          discountamount: number | null
          netamount: number | null
          orderdate: string | null
          orderid: number
          paymentmethod: string | null
          referredby: string | null
          resultdeliverymethod: string | null
          status: string | null
          taxamount: number | null
          totalamount: number
          transactionreference: string | null
        }
        Insert: {
          createdby?: number | null
          customerid?: number | null
          discountamount?: number | null
          netamount?: number | null
          orderdate?: string | null
          orderid?: number
          paymentmethod?: string | null
          referredby?: string | null
          resultdeliverymethod?: string | null
          status?: string | null
          taxamount?: number | null
          totalamount: number
          transactionreference?: string | null
        }
        Update: {
          createdby?: number | null
          customerid?: number | null
          discountamount?: number | null
          netamount?: number | null
          orderdate?: string | null
          orderid?: number
          paymentmethod?: string | null
          referredby?: string | null
          resultdeliverymethod?: string | null
          status?: string | null
          taxamount?: number | null
          totalamount?: number
          transactionreference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laborders_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "laborders_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customerprofiles"
            referencedColumns: ["customerid"]
          },
        ]
      }
      labstats: {
        Row: {
          abnormalresultpercentage: number | null
          date: string
          mostcommontest: string | null
          statid: number
          topreferringdoctor: string | null
          totalpanels: number
          totalrevenue: number
          totaltests: number
        }
        Insert: {
          abnormalresultpercentage?: number | null
          date: string
          mostcommontest?: string | null
          statid?: number
          topreferringdoctor?: string | null
          totalpanels: number
          totalrevenue: number
          totaltests: number
        }
        Update: {
          abnormalresultpercentage?: number | null
          date?: string
          mostcommontest?: string | null
          statid?: number
          topreferringdoctor?: string | null
          totalpanels?: number
          totalrevenue?: number
          totaltests?: number
        }
        Relationships: []
      }
      labtests: {
        Row: {
          categoryid: number | null
          childnormalrange: string | null
          description: string | null
          femalenormalrange: string | null
          instructions: string | null
          isactive: boolean | null
          malenormalrange: string | null
          price: number | null
          sampletype: string | null
          testid: number
          testingmethod: string | null
          testname: string
          turnaroundtime: number | null
          units: string | null
        }
        Insert: {
          categoryid?: number | null
          childnormalrange?: string | null
          description?: string | null
          femalenormalrange?: string | null
          instructions?: string | null
          isactive?: boolean | null
          malenormalrange?: string | null
          price?: number | null
          sampletype?: string | null
          testid?: number
          testingmethod?: string | null
          testname: string
          turnaroundtime?: number | null
          units?: string | null
        }
        Update: {
          categoryid?: number | null
          childnormalrange?: string | null
          description?: string | null
          femalenormalrange?: string | null
          instructions?: string | null
          isactive?: boolean | null
          malenormalrange?: string | null
          price?: number | null
          sampletype?: string | null
          testid?: number
          testingmethod?: string | null
          testname?: string
          turnaroundtime?: number | null
          units?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labtests_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "testcategories"
            referencedColumns: ["categoryid"]
          },
        ]
      }
      notifications: {
        Row: {
          createddatetime: string | null
          isread: boolean | null
          message: string
          notificationid: number
          notificationtype: string | null
          readdatetime: string | null
          referenceid: number | null
          title: string
          userid: number | null
        }
        Insert: {
          createddatetime?: string | null
          isread?: boolean | null
          message: string
          notificationid?: number
          notificationtype?: string | null
          readdatetime?: string | null
          referenceid?: number | null
          title: string
          userid?: number | null
        }
        Update: {
          createddatetime?: string | null
          isread?: boolean | null
          message?: string
          notificationid?: number
          notificationtype?: string | null
          readdatetime?: string | null
          referenceid?: number | null
          title?: string
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      paneltests: {
        Row: {
          panelid: number | null
          paneltestid: number
          testid: number | null
        }
        Insert: {
          panelid?: number | null
          paneltestid?: number
          testid?: number | null
        }
        Update: {
          panelid?: number | null
          paneltestid?: number
          testid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paneltests_panelid_fkey"
            columns: ["panelid"]
            isOneToOne: false
            referencedRelation: "testpanels"
            referencedColumns: ["panelid"]
          },
          {
            foreignKeyName: "paneltests_testid_fkey"
            columns: ["testid"]
            isOneToOne: false
            referencedRelation: "labtests"
            referencedColumns: ["testid"]
          },
        ]
      }
      patientvisits: {
        Row: {
          appointmentid: number | null
          chiefcomplaint: string | null
          customerid: number | null
          diagnosis: string | null
          doctorid: number | null
          followupdate: string | null
          notes: string | null
          prescriptionid: number | null
          treatment: string | null
          visitdate: string | null
          visitid: number
        }
        Insert: {
          appointmentid?: number | null
          chiefcomplaint?: string | null
          customerid?: number | null
          diagnosis?: string | null
          doctorid?: number | null
          followupdate?: string | null
          notes?: string | null
          prescriptionid?: number | null
          treatment?: string | null
          visitdate?: string | null
          visitid?: number
        }
        Update: {
          appointmentid?: number | null
          chiefcomplaint?: string | null
          customerid?: number | null
          diagnosis?: string | null
          doctorid?: number | null
          followupdate?: string | null
          notes?: string | null
          prescriptionid?: number | null
          treatment?: string | null
          visitdate?: string | null
          visitid?: number
        }
        Relationships: [
          {
            foreignKeyName: "patientvisits_appointmentid_fkey"
            columns: ["appointmentid"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointmentid"]
          },
          {
            foreignKeyName: "patientvisits_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customerprofiles"
            referencedColumns: ["customerid"]
          },
          {
            foreignKeyName: "patientvisits_doctorid_fkey"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctorid"]
          },
          {
            foreignKeyName: "patientvisits_prescriptionid_fkey"
            columns: ["prescriptionid"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["prescriptionid"]
          },
        ]
      }
      prescriptionitems: {
        Row: {
          dosage: string | null
          duration: string | null
          frequency: string | null
          instructions: string | null
          prescriptionid: number | null
          prescriptionitemid: number
          productid: number | null
          quantity: number | null
        }
        Insert: {
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          instructions?: string | null
          prescriptionid?: number | null
          prescriptionitemid?: number
          productid?: number | null
          quantity?: number | null
        }
        Update: {
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          instructions?: string | null
          prescriptionid?: number | null
          prescriptionitemid?: number
          productid?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptionitems_prescriptionid_fkey"
            columns: ["prescriptionid"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["prescriptionid"]
          },
          {
            foreignKeyName: "prescriptionitems_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
        ]
      }
      prescriptions: {
        Row: {
          createdby: number | null
          customerid: number | null
          doctorid: number | null
          expirydate: string | null
          notes: string | null
          prescribingdoctor: string | null
          prescriptiondate: string | null
          prescriptionid: number
          prescriptionimage: string | null
        }
        Insert: {
          createdby?: number | null
          customerid?: number | null
          doctorid?: number | null
          expirydate?: string | null
          notes?: string | null
          prescribingdoctor?: string | null
          prescriptiondate?: string | null
          prescriptionid?: number
          prescriptionimage?: string | null
        }
        Update: {
          createdby?: number | null
          customerid?: number | null
          doctorid?: number | null
          expirydate?: string | null
          notes?: string | null
          prescribingdoctor?: string | null
          prescriptiondate?: string | null
          prescriptionid?: number
          prescriptionimage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prescriptions_doctor"
            columns: ["doctorid"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctorid"]
          },
          {
            foreignKeyName: "prescriptions_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "prescriptions_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customerprofiles"
            referencedColumns: ["customerid"]
          },
        ]
      }
      products: {
        Row: {
          categoryid: number | null
          defaulttax: number | null
          description: string | null
          dosageform: string | null
          genericname: string | null
          hsncode: string | null
          isactive: boolean | null
          productid: number
          productname: string
          reorderthreshold: number | null
          requiresprescription: boolean | null
          strength: string | null
          unitofmeasure: string | null
        }
        Insert: {
          categoryid?: number | null
          defaulttax?: number | null
          description?: string | null
          dosageform?: string | null
          genericname?: string | null
          hsncode?: string | null
          isactive?: boolean | null
          productid?: number
          productname: string
          reorderthreshold?: number | null
          requiresprescription?: boolean | null
          strength?: string | null
          unitofmeasure?: string | null
        }
        Update: {
          categoryid?: number | null
          defaulttax?: number | null
          description?: string | null
          dosageform?: string | null
          genericname?: string | null
          hsncode?: string | null
          isactive?: boolean | null
          productid?: number
          productname?: string
          reorderthreshold?: number | null
          requiresprescription?: boolean | null
          strength?: string | null
          unitofmeasure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["categoryid"]
          },
        ]
      }
      productsuppliermapping: {
        Row: {
          ispreferred: boolean | null
          mappingid: number
          pricequoted: number | null
          productid: number | null
          supplierid: number | null
        }
        Insert: {
          ispreferred?: boolean | null
          mappingid?: number
          pricequoted?: number | null
          productid?: number | null
          supplierid?: number | null
        }
        Update: {
          ispreferred?: boolean | null
          mappingid?: number
          pricequoted?: number | null
          productid?: number | null
          supplierid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "productsuppliermapping_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "productsuppliermapping_supplierid_fkey"
            columns: ["supplierid"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplierid"]
          },
        ]
      }
      purchaseorderitems: {
        Row: {
          orderitemid: number
          productid: number | null
          purchaseorderid: number | null
          quantityordered: number | null
          receivedquantity: number | null
          status: string | null
          totalprice: number | null
          unitprice: number | null
        }
        Insert: {
          orderitemid?: number
          productid?: number | null
          purchaseorderid?: number | null
          quantityordered?: number | null
          receivedquantity?: number | null
          status?: string | null
          totalprice?: number | null
          unitprice?: number | null
        }
        Update: {
          orderitemid?: number
          productid?: number | null
          purchaseorderid?: number | null
          quantityordered?: number | null
          receivedquantity?: number | null
          status?: string | null
          totalprice?: number | null
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchaseorderitems_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "purchaseorderitems_purchaseorderid_fkey"
            columns: ["purchaseorderid"]
            isOneToOne: false
            referencedRelation: "purchaseorders"
            referencedColumns: ["purchaseorderid"]
          },
        ]
      }
      purchaseorders: {
        Row: {
          actualdeliverydate: string | null
          createdby: number | null
          expecteddeliverydate: string | null
          notes: string | null
          orderdate: string | null
          paymentterms: string | null
          purchaseorderid: number
          status: string | null
          supplierid: number | null
          totalamount: number
        }
        Insert: {
          actualdeliverydate?: string | null
          createdby?: number | null
          expecteddeliverydate?: string | null
          notes?: string | null
          orderdate?: string | null
          paymentterms?: string | null
          purchaseorderid?: number
          status?: string | null
          supplierid?: number | null
          totalamount: number
        }
        Update: {
          actualdeliverydate?: string | null
          createdby?: number | null
          expecteddeliverydate?: string | null
          notes?: string | null
          orderdate?: string | null
          paymentterms?: string | null
          purchaseorderid?: number
          status?: string | null
          supplierid?: number | null
          totalamount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchaseorders_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "purchaseorders_supplierid_fkey"
            columns: ["supplierid"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplierid"]
          },
        ]
      }
      restocknotifications: {
        Row: {
          currentstock: number | null
          dategenerated: string | null
          notificationid: number
          processedby: number | null
          processeddate: string | null
          productid: number | null
          status: string | null
        }
        Insert: {
          currentstock?: number | null
          dategenerated?: string | null
          notificationid?: number
          processedby?: number | null
          processeddate?: string | null
          productid?: number | null
          status?: string | null
        }
        Update: {
          currentstock?: number | null
          dategenerated?: string | null
          notificationid?: number
          processedby?: number | null
          processeddate?: string | null
          productid?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restocknotifications_processedby_fkey"
            columns: ["processedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "restocknotifications_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
        ]
      }
      saleitems: {
        Row: {
          batchid: number | null
          discount: number | null
          productid: number | null
          quantity: number | null
          saleid: number | null
          saleitemid: number
          taxamount: number | null
          taxpercentage: number | null
          totalprice: number | null
          unitprice: number | null
        }
        Insert: {
          batchid?: number | null
          discount?: number | null
          productid?: number | null
          quantity?: number | null
          saleid?: number | null
          saleitemid?: number
          taxamount?: number | null
          taxpercentage?: number | null
          totalprice?: number | null
          unitprice?: number | null
        }
        Update: {
          batchid?: number | null
          discount?: number | null
          productid?: number | null
          quantity?: number | null
          saleid?: number | null
          saleitemid?: number
          taxamount?: number | null
          taxpercentage?: number | null
          totalprice?: number | null
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saleitems_batchid_fkey"
            columns: ["batchid"]
            isOneToOne: false
            referencedRelation: "batchinventory"
            referencedColumns: ["batchid"]
          },
          {
            foreignKeyName: "saleitems_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "saleitems_saleid_fkey"
            columns: ["saleid"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["saleid"]
          },
        ]
      }
      sales: {
        Row: {
          customerid: number | null
          discountamount: number | null
          netamount: number | null
          paymentmethod: string | null
          prescriptionid: number | null
          saledate: string | null
          saleid: number
          staffid: number | null
          status: string | null
          taxamount: number | null
          totalamount: number
          transactionreference: string | null
        }
        Insert: {
          customerid?: number | null
          discountamount?: number | null
          netamount?: number | null
          paymentmethod?: string | null
          prescriptionid?: number | null
          saledate?: string | null
          saleid?: number
          staffid?: number | null
          status?: string | null
          taxamount?: number | null
          totalamount: number
          transactionreference?: string | null
        }
        Update: {
          customerid?: number | null
          discountamount?: number | null
          netamount?: number | null
          paymentmethod?: string | null
          prescriptionid?: number | null
          saledate?: string | null
          saleid?: number
          staffid?: number | null
          status?: string | null
          taxamount?: number | null
          totalamount?: number
          transactionreference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customerprofiles"
            referencedColumns: ["customerid"]
          },
          {
            foreignKeyName: "sales_prescriptionid_fkey"
            columns: ["prescriptionid"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["prescriptionid"]
          },
          {
            foreignKeyName: "sales_staffid_fkey"
            columns: ["staffid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      salesstats: {
        Row: {
          averageticketsize: number | null
          date: string
          statid: number
          topsellingcategory: string | null
          topsellingproduct: string | null
          totalcustomers: number
          totalitems: number
          totalotcsales: number | null
          totalprescriptionsales: number | null
          totalsales: number
        }
        Insert: {
          averageticketsize?: number | null
          date: string
          statid?: number
          topsellingcategory?: string | null
          topsellingproduct?: string | null
          totalcustomers: number
          totalitems: number
          totalotcsales?: number | null
          totalprescriptionsales?: number | null
          totalsales: number
        }
        Update: {
          averageticketsize?: number | null
          date?: string
          statid?: number
          topsellingcategory?: string | null
          topsellingproduct?: string | null
          totalcustomers?: number
          totalitems?: number
          totalotcsales?: number | null
          totalprescriptionsales?: number | null
          totalsales?: number
        }
        Relationships: []
      }
      samplecollection: {
        Row: {
          collectedby: number | null
          collectiondatetime: string | null
          orderid: number | null
          rejectionreason: string | null
          sampleid: number
          sampletype: string | null
          status: string | null
        }
        Insert: {
          collectedby?: number | null
          collectiondatetime?: string | null
          orderid?: number | null
          rejectionreason?: string | null
          sampleid?: number
          sampletype?: string | null
          status?: string | null
        }
        Update: {
          collectedby?: number | null
          collectiondatetime?: string | null
          orderid?: number | null
          rejectionreason?: string | null
          sampleid?: number
          sampletype?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "samplecollection_collectedby_fkey"
            columns: ["collectedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "samplecollection_orderid_fkey"
            columns: ["orderid"]
            isOneToOne: false
            referencedRelation: "laborders"
            referencedColumns: ["orderid"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contactperson: string | null
          email: string | null
          gstin: string | null
          isactive: boolean | null
          phone: string | null
          supplierid: number
          suppliername: string
        }
        Insert: {
          address?: string | null
          contactperson?: string | null
          email?: string | null
          gstin?: string | null
          isactive?: boolean | null
          phone?: string | null
          supplierid?: number
          suppliername: string
        }
        Update: {
          address?: string | null
          contactperson?: string | null
          email?: string | null
          gstin?: string | null
          isactive?: boolean | null
          phone?: string | null
          supplierid?: number
          suppliername?: string
        }
        Relationships: []
      }
      systemsettings: {
        Row: {
          category: string | null
          datatype: string | null
          description: string | null
          iseditable: boolean | null
          settingid: number
          settingname: string
          settingvalue: string | null
        }
        Insert: {
          category?: string | null
          datatype?: string | null
          description?: string | null
          iseditable?: boolean | null
          settingid?: number
          settingname: string
          settingvalue?: string | null
        }
        Update: {
          category?: string | null
          datatype?: string | null
          description?: string | null
          iseditable?: boolean | null
          settingid?: number
          settingname?: string
          settingvalue?: string | null
        }
        Relationships: []
      }
      taxrates: {
        Row: {
          categoryid: number | null
          description: string | null
          effectivefrom: string
          effectiveto: string | null
          isactive: boolean | null
          taxid: number
          taxname: string
          taxrate: number
        }
        Insert: {
          categoryid?: number | null
          description?: string | null
          effectivefrom: string
          effectiveto?: string | null
          isactive?: boolean | null
          taxid?: number
          taxname: string
          taxrate: number
        }
        Update: {
          categoryid?: number | null
          description?: string | null
          effectivefrom?: string
          effectiveto?: string | null
          isactive?: boolean | null
          taxid?: number
          taxname?: string
          taxrate?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxrates_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["categoryid"]
          },
        ]
      }
      testcategories: {
        Row: {
          categoryid: number
          categoryname: string
          description: string | null
        }
        Insert: {
          categoryid?: number
          categoryname: string
          description?: string | null
        }
        Update: {
          categoryid?: number
          categoryname?: string
          description?: string | null
        }
        Relationships: []
      }
      testpanels: {
        Row: {
          description: string | null
          isactive: boolean | null
          panelid: number
          panelname: string
          price: number | null
        }
        Insert: {
          description?: string | null
          isactive?: boolean | null
          panelid?: number
          panelname: string
          price?: number | null
        }
        Update: {
          description?: string | null
          isactive?: boolean | null
          panelid?: number
          panelname?: string
          price?: number | null
        }
        Relationships: []
      }
      testresults: {
        Row: {
          isabnormal: boolean | null
          lastmodified: string | null
          modifiedby: number | null
          orderitemid: number | null
          result: string | null
          resultid: number
          resultnotes: string | null
          testedby: number | null
          testeddatetime: string | null
          testid: number | null
          verifiedby: number | null
        }
        Insert: {
          isabnormal?: boolean | null
          lastmodified?: string | null
          modifiedby?: number | null
          orderitemid?: number | null
          result?: string | null
          resultid?: number
          resultnotes?: string | null
          testedby?: number | null
          testeddatetime?: string | null
          testid?: number | null
          verifiedby?: number | null
        }
        Update: {
          isabnormal?: boolean | null
          lastmodified?: string | null
          modifiedby?: number | null
          orderitemid?: number | null
          result?: string | null
          resultid?: number
          resultnotes?: string | null
          testedby?: number | null
          testeddatetime?: string | null
          testid?: number | null
          verifiedby?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testresults_modifiedby_fkey"
            columns: ["modifiedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "testresults_orderitemid_fkey"
            columns: ["orderitemid"]
            isOneToOne: false
            referencedRelation: "laborderitems"
            referencedColumns: ["orderitemid"]
          },
          {
            foreignKeyName: "testresults_testedby_fkey"
            columns: ["testedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "testresults_testid_fkey"
            columns: ["testid"]
            isOneToOne: false
            referencedRelation: "labtests"
            referencedColumns: ["testid"]
          },
          {
            foreignKeyName: "testresults_verifiedby_fkey"
            columns: ["verifiedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          notes: string | null
          paymentmethod: string | null
          referenceid: number | null
          status: string | null
          transactiondate: string | null
          transactionid: number
          transactionreference: string | null
          transactiontype: string | null
        }
        Insert: {
          amount: number
          notes?: string | null
          paymentmethod?: string | null
          referenceid?: number | null
          status?: string | null
          transactiondate?: string | null
          transactionid?: number
          transactionreference?: string | null
          transactiontype?: string | null
        }
        Update: {
          amount?: number
          notes?: string | null
          paymentmethod?: string | null
          referenceid?: number | null
          status?: string | null
          transactiondate?: string | null
          transactionid?: number
          transactionreference?: string | null
          transactiontype?: string | null
        }
        Relationships: []
      }
      userrolemapping: {
        Row: {
          mappingid: number
          roleid: number
          userid: number
        }
        Insert: {
          mappingid?: number
          roleid: number
          userid: number
        }
        Update: {
          mappingid?: number
          roleid?: number
          userid?: number
        }
        Relationships: [
          {
            foreignKeyName: "userrolemapping_roleid_fkey"
            columns: ["roleid"]
            isOneToOne: false
            referencedRelation: "userroles"
            referencedColumns: ["roleid"]
          },
          {
            foreignKeyName: "userrolemapping_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      userroles: {
        Row: {
          description: string | null
          roleid: number
          rolename: string
        }
        Insert: {
          description?: string | null
          roleid?: number
          rolename: string
        }
        Update: {
          description?: string | null
          roleid?: number
          rolename?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          datecreated: string | null
          email: string
          firstname: string
          isactive: boolean | null
          lastlogin: string | null
          lastname: string
          passwordhash: string
          phone: string | null
          profile_completed: boolean | null
          profile_picture: string | null
          userid: number
          username: string
        }
        Insert: {
          address?: string | null
          datecreated?: string | null
          email: string
          firstname: string
          isactive?: boolean | null
          lastlogin?: string | null
          lastname: string
          passwordhash: string
          phone?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          userid: number
          username: string
        }
        Update: {
          address?: string | null
          datecreated?: string | null
          email?: string
          firstname?: string
          isactive?: boolean | null
          lastlogin?: string | null
          lastname?: string
          passwordhash?: string
          phone?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          userid?: number
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_doctor_prescriptions: {
        Args: { p_doctor_id: number }
        Returns: {
          prescriptionid: number
          customerid: number
          customerfirstname: string
          customerlastname: string
          prescriptiondate: string
          expirydate: string
          itemcount: number
        }[]
      }
      get_patient_medications: {
        Args: { p_customer_id: number }
        Returns: {
          medication: string
          dosage: string
          frequency: string
          duration: string
          instructions: string
          remaining: number
          refilltrigger: number
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_profile_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: {
          role_name: string
        }[]
      }
      has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
      }
      update_user_profile: {
        Args: {
          p_user_id: string
          p_first_name: string
          p_last_name: string
          p_phone: string
          p_profile_picture?: string
          p_date_of_birth?: string
          p_gender?: string
          p_blood_group?: string
          p_emergency_contact?: string
          p_preferences?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
