
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  result: string | null;
  isabnormal: boolean | null;
}

interface TestDetails {
  testname: string;
  units: string | null;
  malenormalrange: string | null;
  femalenormalrange: string | null;
  childnormalrange: string | null;
}

interface TestResultItemProps {
  result: TestResult;
  test: TestDetails;
  gender?: string | null;
}

const TestResultItem: React.FC<TestResultItemProps> = ({ result, test, gender }) => {
    const getNormalRange = () => {
        if (gender === 'Male') return test.malenormalrange;
        if (gender === 'Female') return test.femalenormalrange;
        return test.childnormalrange || test.malenormalrange || test.femalenormalrange || 'N/A';
    };

    const normalRange = getNormalRange();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3">
            <div className="font-medium text-gray-800">{test.testname}</div>
            <div className="text-left md:text-center">
                <span className={`font-semibold text-lg ${result.isabnormal ? 'text-red-600' : 'text-gray-900'}`}>{result.result || 'N/A'}</span>
                {test.units && <span className="text-sm text-gray-500 ml-1">{test.units}</span>}
                {result.isabnormal && (
                    <Badge variant="destructive" className="ml-2">Abnormal</Badge>
                )}
            </div>
            <div className="text-left md:text-right text-sm text-gray-600">
                <span className="font-medium">Normal Range:</span> {normalRange}
            </div>
        </div>
    );
};

export default TestResultItem;
