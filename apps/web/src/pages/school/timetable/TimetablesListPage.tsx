import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, Timetable } from '@/api/timetable';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  ArrowRight, 
  CheckCircle,
  Edit2,
  Bookmark
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TimetablesListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreatingDraft, setIsCreatingDraft] = React.useState(false);
  const [selectedYearId, setSelectedYearId] = React.useState('');
  const [selectedClassId, setSelectedClassId] = React.useState('');
  const [selectedSectionId, setSelectedSectionId] = React.useState('');

  // Fetch Academic Years
  const { data: years } = useQuery({
    queryKey: ['academicYearsList'],
    queryFn: () => academicYearsApi.list()
  });

  // Fetch Classes
  const { data: classes } = useQuery({
    queryKey: ['classesList'],
    queryFn: () => classesApi.listClasses()
  });

  // Fetch Sections (depends on class)
  const { data: sections } = useQuery({
    queryKey: ['sectionsList', selectedClassId],
    queryFn: () => classesApi.listSections(selectedClassId),
    enabled: !!selectedClassId
  });

  // Fetch Timetables
  const { data: timetables, isLoading } = useQuery({
    queryKey: ['timetablesList', selectedYearId],
    queryFn: () => timetableApi.listTimetables(selectedYearId || undefined)
  });

  React.useEffect(() => {
    if (years && years.length > 0 && !selectedYearId) {
      const current = years.find(y => y.isCurrent) || years[0];
      setSelectedYearId(current.id);
    }
  }, [years]);

  const createDraftMutation = useMutation({
    mutationFn: (data: { academicYearId: string; classId: string; sectionId: string }) =>
      timetableApi.createTimetable(data),
    onSuccess: (newTimetable) => {
      toast.success('Timetable draft established!');
      setIsCreatingDraft(false);
      setSelectedClassId('');
      setSelectedSectionId('');
      queryClient.invalidateQueries({ queryKey: ['timetablesList'] });
      navigate(`/timetable/builder/${newTimetable.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create draft');
    }
  });

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearId || !selectedClassId || !selectedSectionId) {
      toast.error('Please select academic year, class, and section');
      return;
    }
    createDraftMutation.mutate({
      academicYearId: selectedYearId,
      classId: selectedClassId,
      sectionId: selectedSectionId
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Class Timetables Catalog</h1>
            <p className="text-xs text-slate-400">Design weekly schedule drafts and manage official published timetable versions.</p>
          </div>
        </div>

        <Button 
          onClick={() => setIsCreatingDraft(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Design Draft
        </Button>
      </div>

      {/* Filter and Create Modal Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Create Draft card */}
        {isCreatingDraft && (
          <div className="lg:col-span-1 rounded-xl border border-indigo-500/30 bg-slate-950 p-6 space-y-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-400" />
              Design New Draft
            </h3>
            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Year</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="">Select Year...</option>
                  {years?.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Grade Level / Class *</label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="">Select Class...</option>
                  {classes?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Section Room *</label>
                <select
                  required
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="">Select Section...</option>
                  {sections?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCreatingDraft(false)}
                  className="text-slate-400 hover:text-slate-200 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDraftMutation.isPending || !selectedSectionId}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 text-xs"
                >
                  Create Draft
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Right Side: List Grid */}
        <div className={`${isCreatingDraft ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Academic Year</span>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none w-48"
            >
              {years?.map(y => (
                <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>

          {timetables?.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Calendar className="h-8 w-8 opacity-40" />
              <p className="text-xs">No timetables exist for the selected academic year.</p>
              {!isCreatingDraft && (
                <Button 
                  onClick={() => setIsCreatingDraft(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4"
                >
                  Create your first schedule
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {timetables?.map(table => (
                <div 
                  key={table.id}
                  className="p-5 rounded-xl border border-slate-900 bg-slate-950 hover:border-slate-800 hover:shadow-lg hover:shadow-slate-950/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-lg text-slate-200">
                        {table.class.name} - {table.section.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${table.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : table.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        {table.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-900 pt-3">
                      <div className="flex justify-between">
                        <span>Version Number</span>
                        <span className="font-semibold text-slate-200">v{table.versionNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Academic Year</span>
                        <span className="text-slate-350">{table.academicYear.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3 pt-3 border-t border-slate-900">
                    <Link to={`/timetable/builder/${table.id}`} className="w-full">
                      <Button className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-indigo-400 font-semibold flex items-center justify-center gap-1">
                        <Edit2 className="h-3.5 w-3.5" />
                        {table.status === 'PUBLISHED' ? 'View/Edit Published' : 'Build Weekly Grid'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
