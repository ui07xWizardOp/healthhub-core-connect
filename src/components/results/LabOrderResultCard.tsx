
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabOrderWithResults } from './TestResultViewer';
import TestResultItem from './TestResultItem';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface LabOrderResultCardProps {
  order: LabOrderWithResults;
  gender?: string | null;
}

const LabOrderResultCard: React.FC<LabOrderResultCardProps> = ({ order, gender }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'Delivered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'InProcess':
         return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Process</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-healthhub-blue"/>
                Lab Order #{order.orderid}
            </CardTitle>
            <CardDescription>
              Ordered on {format(new Date(order.orderdate), 'MMMM d, yyyy')}
              {order.referredby && ` | Referred by: ${order.referredby}`}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="results">
            <AccordionTrigger>View Results</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {order.laborderitems.map(item => {
                    if (item.testpanels) {
                        return (
                            <div key={item.orderitemid} className="p-4 border rounded-lg bg-gray-50/50">
                                <h4 className="font-semibold">{item.testpanels.panelname}</h4>
                                <div className="pl-4 mt-2 space-y-2 divide-y">
                                {item.testresults.map(result => (
                                    result.labtests && <TestResultItem key={result.resultid} result={result} test={result.labtests} gender={gender} />
                                ))}
                                </div>
                            </div>
                        );
                    }
                    if (item.labtests) {
                       const testResult = item.testresults[0];
                       return testResult && <div className="divide-y border rounded-lg"><TestResultItem key={item.orderitemid} result={testResult} test={item.labtests} gender={gender} /></div>;
                    }
                    return null;
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default LabOrderResultCard;
