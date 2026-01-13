import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ms } from 'date-fns/locale';
import Link from 'next/link';

interface Submission {
  id: string;
  applicantName: string;
  icNo: string;
  createdAt: string;
}

interface RecentSubmissionsProps {
  data: Submission[];
}

export default function RecentSubmissions({ data }: RecentSubmissionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendaftaran Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Tiada rekod</p>
          ) : (
            data.map((submission) => (
              <Link
                key={submission.id}
                href={`/isi-rumah/${submission.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{submission.applicantName}</p>
                  <p className="text-sm text-gray-600">{submission.icNo}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(submission.createdAt), { 
                    addSuffix: true,
                    locale: ms 
                  })}
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
