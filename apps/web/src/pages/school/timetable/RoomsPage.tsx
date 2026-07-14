import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, Room } from '@/api/timetable';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Save, 
  Eye, 
  EyeOff, 
  Sparkles,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  
  // Create Room state
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [roomType, setRoomType] = React.useState<'CLASSROOM' | 'LAB' | 'LIBRARY' | 'AUDITORIUM' | 'SPORTS' | 'OTHER'>('CLASSROOM');
  const [capacity, setCapacity] = React.useState('');

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['roomsList'],
    queryFn: () => timetableApi.listRooms()
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Room, 'id' | 'status'>) => timetableApi.createRoom(data),
    onSuccess: () => {
      toast.success('Physical room added successfully!');
      setIsCreatingRoom(false);
      setName('');
      setCode('');
      setRoomType('CLASSROOM');
      setCapacity('');
      queryClient.invalidateQueries({ queryKey: ['roomsList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add room');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      timetableApi.updateRoom(payload.id, { status: payload.status }),
    onSuccess: () => {
      toast.success('Room status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['roomsList'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createMutation.mutate({
      name,
      code: code || undefined,
      roomType,
      capacity: capacity ? Number(capacity) : undefined
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Physical School Rooms</h1>
          <p className="text-xs text-slate-400">Add and manage classrooms, laboratories, auditoriums, and their seating capacities.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Pane: Add Room Form */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            Add Physical Room
          </h3>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Room Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Room 101, Science Lab"
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Room Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. R-101, L-SCI"
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as any)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="CLASSROOM">Classroom</option>
                <option value="LAB">Laboratory</option>
                <option value="LIBRARY">Library</option>
                <option value="AUDITORIUM">Auditorium</option>
                <option value="SPORTS">Sports Ground/Gym</option>
                <option value="OTHER">Other Space</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Seating Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 40"
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !name}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-100 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors mt-2"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Adding Room...' : 'Add Room'}
            </Button>
          </form>
        </div>

        {/* Right Pane: Rooms Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-400" />
            Rooms Catalog ({rooms?.length || 0})
          </h3>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
            {rooms?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <MapPin className="h-8 w-8 opacity-40" />
                <p className="text-xs">No rooms added to catalog yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rooms?.map(room => (
                  <div key={room.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/30 transition-all flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{room.name}</span>
                        {room.code && (
                          <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded">
                            {room.code}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {room.roomType}
                        </span>
                        {room.capacity && (
                          <span className="bg-slate-800/50 text-slate-350 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Users className="h-3 w-3 text-slate-400" /> {room.capacity} seats
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStatusMutation.mutate({
                        id: room.id,
                        status: room.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                      })}
                      className={`rounded p-2 border transition-all ${room.status === 'ACTIVE' ? 'border-slate-800 hover:bg-slate-900 hover:text-amber-400 text-slate-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10'}`}
                      title={room.status === 'ACTIVE' ? 'Deactivate Room' : 'Activate Room'}
                    >
                      {room.status === 'ACTIVE' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
