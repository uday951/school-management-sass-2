import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useChildStore } from '@/store'
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
  const { activeChild } = useChildStore()
  const params = useParams()
  const id = params.id || activeChild?._id || activeChild?.id
  const [allocation, setAllocation] = useState(null)
  const [routeStops, setRouteStops] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChildTransport = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/portal/child/${id}/transport`)
      if (res.data.success && res.data.data) {
        setAllocation(res.data.data.allocation)
        setRouteStops(res.data.data.stops || [])
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
                    <p className="text-muted-foreground text-xs">{allocation.routeId?.assignedVehicle?.manufacturer || 'N/A'} {allocation.routeId?.assignedVehicle?.model || 'N/A'}</p>
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

          <div className="lg:col-span-2 space-y-6">
            <SimpleCard title="Route Information" className="mt-4">
              <div className="space-y-3">
                {allocation?.routeId ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Route</p>
                        <p className="font-semibold text-foreground">{allocation.routeId.routeName || allocation.routeId.name || 'N/A'}</p>
                      </div>
                    </div>
                    {routeStops && routeStops.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Route Stops</p>
                        {routeStops.map((stop, i) => (
                          <div key={stop._id || i} className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              stop._id === allocation.pickupStopId?._id ? 'bg-emerald-500' :
                              stop._id === allocation.dropStopId?._id ? 'bg-red-500' : 'bg-muted-foreground/40'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{stop.stopName || stop.name}</p>
                              {(stop.pickupTime || stop.dropTime) && (
                                <p className="text-xs text-muted-foreground">
                                  Pickup: {stop.pickupTime || 'N/A'} &bull; Drop: {stop.dropTime || 'N/A'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No route information available.</p>
                )}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
