import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportApi, type Vehicle, type DriverProfile, type TransportRoute, type TransportStop } from '@/api/transport';
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
import { Truck, MapPin, Route, Navigation, Users, Plus, Star, Compass } from 'lucide-react';
import { toast } from 'sonner';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration Number is required'),
  vehicleType: z.enum(['BUS', 'MINI_BUS', 'VAN', 'CAR', 'OTHER']),
  seatingCapacity: z.coerce.number().min(1, 'Capacity must be at least 1')
});

const stopSchema = z.object({
  name: z.string().min(1, 'Stop Name is required'),
  code: z.string().optional(),
  addressText: z.string().optional()
});

const routeSchema = z.object({
  name: z.string().min(1, 'Route Name is required'),
  code: z.string().optional()
});

export default function TransportPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'vehicles' | 'routes' | 'stops'>('dashboard');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = React.useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = React.useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = React.useState(false);

  // Queries
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['transportMetrics'],
    queryFn: transportApi.getDashboardStats
  });

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['transportVehicles'],
    queryFn: transportApi.listVehicles
  });

  const { data: routes, isLoading: loadingRoutes } = useQuery({
    queryKey: ['transportRoutes'],
    queryFn: transportApi.listRoutes
  });

  const { data: stops, isLoading: loadingStops } = useQuery({
    queryKey: ['transportStops'],
    queryFn: transportApi.listStops
  });

  // Forms
  const vehicleForm = useForm({ resolver: zodResolver(vehicleSchema) });
  const stopForm = useForm({ resolver: zodResolver(stopSchema) });
  const routeForm = useForm({ resolver: zodResolver(routeSchema) });

  // Mutations
  const createVehicleMutation = useMutation({
    mutationFn: transportApi.createVehicle,
    onSuccess: () => {
      toast.success('Vehicle added successfully');
      queryClient.invalidateQueries({ queryKey: ['transportVehicles'] });
      setIsVehicleModalOpen(false);
      vehicleForm.reset();
    }
  });

  const createStopMutation = useMutation({
    mutationFn: transportApi.createStop,
    onSuccess: () => {
      toast.success('Stop registered successfully');
      queryClient.invalidateQueries({ queryKey: ['transportStops'] });
      setIsStopModalOpen(false);
      stopForm.reset();
    }
  });

  const createRouteMutation = useMutation({
    mutationFn: transportApi.createRoute,
    onSuccess: () => {
      toast.success('Route created successfully');
      queryClient.invalidateQueries({ queryKey: ['transportRoutes'] });
      setIsRouteModalOpen(false);
      routeForm.reset();
    }
  });

  if (loadingMetrics) {
    return <PageLoader />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground">Monitor vehicle fleets, route stops, driver allocations, and manifests.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'vehicles' && (
            <Button onClick={() => setIsVehicleModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Vehicle
            </Button>
          )}
          {activeTab === 'stops' && (
            <Button onClick={() => setIsStopModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Register Stop
            </Button>
          )}
          {activeTab === 'routes' && (
            <Button onClick={() => setIsRouteModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Route
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-px">
        <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} onClick={() => setActiveTab('dashboard')}>
          <Compass className="mr-2 h-4 w-4" /> Dashboard
        </Button>
        <Button variant={activeTab === 'vehicles' ? 'default' : 'ghost'} onClick={() => setActiveTab('vehicles')}>
          <Truck className="mr-2 h-4 w-4" /> Fleet
        </Button>
        <Button variant={activeTab === 'routes' ? 'default' : 'ghost'} onClick={() => setActiveTab('routes')}>
          <Route className="mr-2 h-4 w-4" /> Routes Map
        </Button>
        <Button variant={activeTab === 'stops' ? 'default' : 'ghost'} onClick={() => setActiveTab('stops')}>
          <MapPin className="mr-2 h-4 w-4" /> Stop Register
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeVehicles || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeRoutes || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students Assigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.studentsAssigned || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vehicles in Maintenance</CardTitle>
              <AlertIcon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.maintenanceVehicles || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <CardTitle>Fleet Registry</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVehicles ? (
              <PageLoader />
            ) : !vehicles || vehicles.length === 0 ? (
              <EmptyState icon={Truck} title="No Vehicles" description="Add vehicles to start routes assignment tracking." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.registrationNumber}</TableCell>
                      <TableCell>{v.vehicleType}</TableCell>
                      <TableCell>{v.seatingCapacity} Seats</TableCell>
                      <TableCell>
                        <Badge variant={v.status === 'ACTIVE' ? 'default' : 'outline'}>{v.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'routes' && (
        <Card>
          <CardHeader>
            <CardTitle>Map Routes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRoutes ? (
              <PageLoader />
            ) : !routes || routes.length === 0 ? (
              <EmptyState icon={Route} title="No Routes Map" description="Create a route to map sequencing stops." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Stops Sequence</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.stops.length} Stops</TableCell>
                      <TableCell>
                        <Badge>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'stops' && (
        <Card>
          <CardHeader>
            <CardTitle>Stops Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStops ? (
              <PageLoader />
            ) : !stops || stops.length === 0 ? (
              <EmptyState icon={MapPin} title="No Stops Registered" description="Register stops to sequenciate routes maps." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stop Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stops.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.code || '-'}</TableCell>
                      <TableCell>{s.addressText || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Dialogs */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Register Fleet Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={vehicleForm.handleSubmit((data) => createVehicleMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label>Registration Number</Label>
                  <Input {...vehicleForm.register('registrationNumber')} placeholder="DL-3C-AB-1234" />
                </div>
                <div>
                  <Label>Seating Capacity</Label>
                  <Input {...vehicleForm.register('seatingCapacity')} type="number" defaultValue="40" />
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select onValueChange={(val) => vehicleForm.setValue('vehicleType', val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUS">Bus</SelectItem>
                      <SelectItem value="MINI_BUS">Mini Bus</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsVehicleModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Vehicle</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isStopModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Register New Stop</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={stopForm.handleSubmit((data) => createStopMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label>Stop Name</Label>
                  <Input {...stopForm.register('name')} placeholder="e.g. Sector 12 Market" />
                </div>
                <div>
                  <Label>Address Text</Label>
                  <Input {...stopForm.register('addressText')} placeholder="Near Police Station" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsStopModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Stop</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Create Route</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={routeForm.handleSubmit((data) => createRouteMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label>Route Name</Label>
                  <Input {...routeForm.register('name')} placeholder="e.g. Route 5 Afternoon" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsRouteModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Route</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
