import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Badge,
  StatusChip
} from '@/components/shared'
import { Bus, Phone, MapPin, User, Navigation, AlertTriangle } from 'lucide-react'

export default function ChildTransport() {
  const { id } = useParams()
  const [allocation, setAllocation] = useState(null)
  const [routeStops, setRouteStops] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChildTransport = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/transport/allocations?studentId=${id}`)
      if (res.data.success && res.data.data.length > 0) {
        const alloc = res.data.data[0]
        setAllocation(alloc)

        // Fetch stops for the assigned route
        if (alloc.routeId?._id) {
          const stopsRes = await axiosClient.get(`/transport/stops?routeId=${alloc.routeId._id}`)
          if (stopsRes.data.success) {
            setRouteStops(stopsRes.data.data)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchChildTransport()
  }, [id])

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-sm font-semibold text-muted-foreground">Loading transport details...</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Student Transport telemetry"
        subtitle="Real-time vehicle location, route schedule, and assigned stop status details."
      />

      {!allocation ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-border text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-warning mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-1">No Transport Allocation Found</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            This student is not currently allocated to any school bus route. Please contact the school administration office to register for transport services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <SimpleCard title="Assigned Fleet & Driver">
              <div className="space-y-4 text-sm font-semibold select-none leading-relaxed">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Vehicle Details</h3>
                    <p className="text-muted-foreground text-xs">{allocation.routeId?.assignedVehicle?.manufacturer || 'Tata'} {allocation.routeId?.assignedVehicle?.model || 'Starbus 2026'}</p>
                    <Badge className="mt-1">{allocation.routeId?.assignedVehicle?.vehicleNo || 'N/A'}</Badge>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Driver Contact</h3>
                    <p className="text-muted-foreground text-xs">{allocation.routeId?.assignedDriver?.name || 'Unassigned'}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-bold">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{allocation.routeId?.assignedDriver?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SimpleCard>

            <SimpleCard title="Scheduled Route Stops">
              <div className="space-y-4">
                <div className="border-l-2 border-primary/30 pl-4 ml-2 space-y-6">
                  {routeStops.map((stop, idx) => {
                    const isPickup = stop._id === allocation.pickupStopId?._id
                    const isDrop = stop._id === allocation.dropStopId?._id
                    return (
                      <div key={stop._id} className="relative">
                        <div className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background transition-colors ${
                          isPickup || isDrop ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {stop.stopName}
                            {isPickup && <Badge variant="secondary" className="text-[10px] py-0">Pickup Stop</Badge>}
                            {isDrop && <Badge variant="outline" className="text-[10px] py-0">Drop Stop</Badge>}
                          </h4>
                          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                            Pickup: {stop.pickupTime} | Drop: {stop.dropTime}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </SimpleCard>
          </div>

          {/* Telemetry Column */}
          <div className="lg:col-span-2 space-y-6">
            <SimpleCard title="GPS Route Telemetry (Architecture Ready)">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-slate-950 flex flex-col justify-between p-4 text-white">
                {/* Simulated Map Background Grid */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Telemetry Header overlay */}
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary animate-pulse" />
                      Route {allocation.routeId?.routeCode || 'R-101'} active telemetry
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimated time remaining: 12 mins</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white">LIVE GPS</Badge>
                </div>

                {/* Simulated Location Dot */}
                <div className="relative z-10 self-center flex flex-col items-center">
                  <div className="h-4 w-4 bg-primary rounded-full animate-ping absolute" />
                  <div className="h-4 w-4 bg-primary rounded-full border-2 border-white relative" />
                  <span className="text-[10px] font-bold mt-1.5 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">Bus Location</span>
                </div>

                {/* Telemetry Stats overlay */}
                <div className="relative z-10 grid grid-cols-3 gap-2 bg-black/60 p-3 rounded-lg border border-white/10 text-xs font-semibold select-none backdrop-blur-sm">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">CURRENT SPEED</span>
                    <span>42 km/h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">STATUS</span>
                    <span className="text-emerald-400">On Schedule</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">GPS SIGNAL</span>
                    <span className="text-emerald-400">Strong</span>
                  </div>
                </div>
              </div>
            </SimpleCard>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
