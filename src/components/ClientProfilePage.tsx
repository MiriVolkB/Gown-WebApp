import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Client, Appointment } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface ClientProfilePageProps {
  client: Client;
  appointments: Appointment[];
  onBack: () => void;
  onEditClient?: () => void;
  onNewAppointment: () => void;
}

export function ClientProfilePage({
  client,
  appointments,
  onBack,
  onEditClient,
  onNewAppointment,
}: ClientProfilePageProps) {
  if (!client) {
    return null;
  }

  const clientAppointments = appointments?.filter((apt) => apt.clientId === client.id) || [];
  const latestMeasurement =
    client.measurements && client.measurements.length > 0
      ? client.measurements[client.measurements.length - 1]
      : null;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (time: string | Date | null | undefined) => {
    if (!time) return 'N/A';
    try {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid time';
    }
  };

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Clients
      </Button>

      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="mb-1">
              {client.name}
            </h2>
            <p className="text-muted-foreground">{client.phone}</p>
          </div>
          <div className="flex gap-3">
            {onEditClient && (
              <Button variant="outline" onClick={onEditClient}>
                Edit Information
              </Button>
            )}
            <Button onClick={onNewAppointment}>Book Appointment</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="information" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="dates">Important Dates</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="information">
          <div className="bg-white border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Name</div>
                <div>{client.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Phone</div>
                <div>{client.phone}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div>{client.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Recommended</div>
                <div>{client?.Recommended || 'N/A'}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="measurements">
          <div className="bg-white border border-border rounded-lg p-6">
            {latestMeasurement ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bust</div>
                  <div>{latestMeasurement.Bust ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Waist</div>
                  <div>{latestMeasurement.waist ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Hips</div>
                  <div>{latestMeasurement.Hips ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Shirt Length</div>
                  <div>{latestMeasurement.ShirtLength ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Skirt Length</div>
                  <div>{latestMeasurement.SkirtLength ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sleeve Length</div>
                  <div>{latestMeasurement.SleeveLength ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sleeve Width</div>
                  <div>{latestMeasurement.SleeveWidth ?? 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Shoulder to Bust</div>
                  <div>{latestMeasurement.ShoulderToBust ?? 'N/A'}</div>
                </div>
                {latestMeasurement.notes && (
                  <div className="col-span-full">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <div className="whitespace-pre-wrap">{latestMeasurement.notes}</div>
                  </div>
                )}
                <div className="col-span-full text-sm text-muted-foreground">
                  Measurement Date: {formatDate(latestMeasurement.date)}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No measurements recorded yet
              </div>
            )}
            {client.measurements && client.measurements.length > 1 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-sm font-medium mb-4">Measurement History</div>
                <div className="space-y-4">
                  {client.measurements.slice(0, -1).reverse().map((measurement) => (
                    <div key={measurement.id} className="text-sm">
                      <div className="font-medium mb-2">{formatDate(measurement.date)}</div>
                      <div className="grid grid-cols-3 gap-4 text-muted-foreground">
                        <div>Bust: {measurement.Bust ?? 'N/A'}</div>
                        <div>Waist: {measurement.waist ?? 'N/A'}</div>
                        <div>Hips: {measurement.Hips ?? 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dates">
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Wedding Date</div>
                <div>{formatDate(client.WeddingDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Need Gown By</div>
                <div>{formatDate(client.NeedGownBy)}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Notes</div>
            <div className="whitespace-pre-wrap">{client?.notes || 'No notes available'}</div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            {clientAppointments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No appointments scheduled
              </div>
            ) : (
              <div className="divide-y divide-border">
                {clientAppointments.map((apt) => (
                  <div key={apt.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{apt.service}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(apt.date)} at {formatTime(apt.time)}
                        </div>
                        {apt.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{apt.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
