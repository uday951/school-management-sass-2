import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarOpsApi, type CalendarEvent, type WorkingDayException } from '@/api/calendarOps';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Calendar, Plus, MapPin, Tag, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventType: z.enum(['HOLIDAY', 'ACADEMIC', 'EXAM', 'SPORTS', 'CULTURAL', 'MEETING', 'DEADLINE', 'SCHOOL_EVENT', 'STAFF_EVENT', 'OTHER']),
  startAt: z.string().min(1, 'Start time is required'),
  endAt: z.string().min(1, 'End time is required'),
  allDay: z.boolean().default(false),
  locationText: z.string().optional()
});

const exceptionSchema = z.object({
  academicYearId: z.string().min(1, 'Academic Year ID is required'),
  date: z.string().min(1, 'Date is required'),
  exceptionType: z.enum(['WORKING_DAY', 'NON_WORKING_DAY']),
  reason: z.string().min(1, 'Reason is required')
});

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'timeline' | 'exceptions'>('timeline');
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = React.useState(false);

  // Queries
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => calendarOpsApi.listEvents()
  });

  const { data: exceptions, isLoading: loadingExceptions } = useQuery({
    queryKey: ['workingDayExceptions'],
    queryFn: calendarOpsApi.listExceptions
  });

  // Forms
  const eventForm = useForm({ resolver: zodResolver(eventSchema) });
  const exceptionForm = useForm({ resolver: zodResolver(exceptionSchema) });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: calendarOpsApi.createEvent,
    onSuccess: () => {
      toast.success('Calendar event published successfully');
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['workingDayExceptions'] });
      setIsEventModalOpen(false);
      eventForm.reset();
    }
  });

  const cancelEventMutation = useMutation({
    mutationFn: calendarOpsApi.cancelEvent,
    onSuccess: () => {
      toast.success('Calendar event cancelled');
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['workingDayExceptions'] });
    }
  });

  const createExceptionMutation = useMutation({
    mutationFn: calendarOpsApi.createException,
    onSuccess: () => {
      toast.success('Working day exception updated');
      queryClient.invalidateQueries({ queryKey: ['workingDayExceptions'] });
      setIsExceptionModalOpen(false);
      exceptionForm.reset();
    }
  });

  if (loadingEvents) {
    return <PageLoader />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
          <p className="text-muted-foreground">Manage holidays lists, school events timeline, and compensatory working-day exceptions.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'timeline' ? (
            <Button onClick={() => setIsEventModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Declare Event / Holiday
            </Button>
          ) : (
            <Button onClick={() => setIsExceptionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Override Day
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-px">
        <Button variant={activeTab === 'timeline' ? 'default' : 'ghost'} onClick={() => setActiveTab('timeline')}>
          <Calendar className="mr-2 h-4 w-4" /> School Events
        </Button>
        <Button variant={activeTab === 'exceptions' ? 'default' : 'ghost'} onClick={() => setActiveTab('exceptions')}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Working Day Exceptions
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Agenda & Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            {!events || events.length === 0 ? (
              <EmptyState icon={Calendar} title="No Events Registered" description="Declare school activities and holiday timetables." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>
                        <Badge variant={e.eventType === 'HOLIDAY' ? 'destructive' : 'default'}>{e.eventType}</Badge>
                      </TableCell>
                      <TableCell>{new Date(e.startAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(e.endAt).toLocaleString()}</TableCell>
                      <TableCell>{e.locationText || 'School Campus'}</TableCell>
                      <TableCell className="text-right">
                        {e.status === 'PUBLISHED' && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelEventMutation.mutate(e.id)}>
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'exceptions' && (
        <Card>
          <CardHeader>
            <CardTitle>Working Day Exceptions</CardTitle>
            <CardDescription>Exceptions override the normal calendar rules for attendance and timetables logs.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExceptions ? (
              <PageLoader />
            ) : !exceptions || exceptions.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No Exceptions Active" description="No working day overrides exist. Weekend rules govern normally." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.map((exc) => (
                    <TableRow key={exc.id}>
                      <TableCell className="font-medium">{new Date(exc.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={exc.exceptionType === 'WORKING_DAY' ? 'default' : 'secondary'}>
                          {exc.exceptionType === 'WORKING_DAY' ? 'Working Day Override' : 'Holiday Override'}
                        </Badge>
                      </TableCell>
                      <TableCell>{exc.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Declare Calendar Event / Holiday</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={eventForm.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input {...eventForm.register('title')} placeholder="e.g. Independence Day" />
                </div>
                <div>
                  <Label>Event Type</Label>
                  <Select onValueChange={(val) => eventForm.setValue('eventType', val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOLIDAY">Holiday</SelectItem>
                      <SelectItem value="ACADEMIC">Academic Activity</SelectItem>
                      <SelectItem value="EXAM">Exam Session</SelectItem>
                      <SelectItem value="SCHOOL_EVENT">General Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input {...eventForm.register('startAt')} type="datetime-local" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input {...eventForm.register('endAt')} type="datetime-local" />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input {...eventForm.register('locationText')} placeholder="e.g. Main Auditorium" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Publish Event</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
