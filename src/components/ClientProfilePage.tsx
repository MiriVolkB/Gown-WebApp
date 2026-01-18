"use client";
import { useState } from "react";

import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Client, Appointment, Measurement } from '../types'; // Import Measurement
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AddMeasurementModal } from "@/components/AddMeasurementModal";
import { EditClientModal } from "@/components/EditClientModal";



interface ClientProfilePageProps {
  client: Client;
  appointments: Appointment[];
  onBack?: () => void;
  onNewAppointment?: () => void;

}

// Define the Deep Navy color value
const deepNavy = '#1E2024';
const lightGrayBackground = '#F7F7F7';

// Helper component for displaying data field pairs
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-sm mb-1" style={{ color: 'gray' }}>{label}</div>
    <div className="font-medium" style={{ color: deepNavy }}>{value}</div>
  </div>
);

// --- New Component: Displays a single set of measurements ---
const SingleMeasurementDisplay = ({ measurement }: { measurement: Measurement }) => {
  // Helper to format values consistently
  const formatValue = (value: number | undefined) =>
    (value !== undefined ? `${value} cm` : 'N/A');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8">
      {/* Row 1 */}
      <DetailItem label="Bust" value={formatValue(measurement.Bust)} />
      <DetailItem label="Waist" value={formatValue(measurement.waist)} />
      <DetailItem label="Hips" value={formatValue(measurement.Hips)} />

      {/* Row 2 */}
      <DetailItem label="Shoulder to Bust" value={formatValue(measurement.ShoulderToBust)} />
      <DetailItem label="Sleeve Length" value={formatValue(measurement.SleeveLength)} />
      <DetailItem label="Sleeve Width" value={formatValue(measurement.SleeveWidth)} />

      {/* Row 3 */}
      <DetailItem label="Shirt Length" value={formatValue(measurement.ShirtLength)} />
      <DetailItem label="Skirt Length" value={formatValue(measurement.SkirtLength)} />
      <div className="col-span-2">
        <DetailItem label="Notes" value={measurement.notes || 'None'} />
      </div>
    </div>
  );
};
// -----------------------------------------------------------


export function ClientProfilePage({
  client,
  appointments,
  onBack,
  onNewAppointment,

}: ClientProfilePageProps) {
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();
  const clientAppointments = appointments.filter((apt) => apt.clientId === client.id);
  const handleEditClient = () => {
    router.push(`/clients/${client.id}/edit`);
  };

  const handleNewAppointment = () => {
    router.push(`/appointments/new?clientId=${client.id}`);
  };

  const handleSaveField = async (field: keyof Measurement, value: number | string) => {
    if (!editingMeasurement) return;

    await fetch(`/api/measurements/${editingMeasurement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: Number(value) }),
    });

    router.refresh();
  };

  const handleDeleteMeasurement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this measurement?")) return;

    try {
      await fetch(`/api/measurements/${id}`, { method: "DELETE" });
      // Refresh measurements (or reload)
      router.refresh(); // Next.js 13+ recommended
    } catch (error) {
      console.error("Failed to delete measurement", error);
    }
  };

  // Assuming the latest measurement is the first one in the array
  const latestMeasurement = client.measurements?.[0];

  return (
    // Apply the light gray background to the container
    <div className="min-h-screen p-8" style={{ backgroundColor: lightGrayBackground }}>
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <Button variant="ghost" onClick={() => {
          if (onBack) {
            onBack();
          } else {
            router.push('/clients');
          }
        }} className="mb-8 p-0" style={{ color: deepNavy }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>

        {/* Client Header/Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div>
              {/* Elegant Font (Playfair Display/Serif) and Deep Navy color */}
              <h2
                className="text-4xl font-light mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: deepNavy }}
              >
                {client.name}
              </h2>
              <p className="text-gray-500 mb-4">{client.email} | {client.phone}</p>
            </div>
            <div className="flex gap-3">
              {/* Edit Button - Styled to match the theme (outline) */}
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(true)}
                className="text-sm border-gray-300 hover:bg-gray-50"
                style={{ color: deepNavy }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              {/* Book Appointment Button - Deep Navy background, white text */}
              <Button
                onClick={handleNewAppointment}
                className="text-sm shadow-md transition hover:bg-opacity-90"
                style={{ backgroundColor: deepNavy, color: 'white' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {isEditOpen && (
          <EditClientModal
            client={client}
            onClose={() => setIsEditOpen(false)}
            onSave={() => router.refresh()} // refresh the page to show updated info
          />
        )}


        {/* Tabs Navigation */}
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 mb-6">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          {/* 1. INFORMATION Tab */}
          <TabsContent value="information">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8">

                {/* Personal Details */}
                <DetailItem label="Name" value={client.name} />
                <DetailItem label="Phone" value={client.phone} />
                <DetailItem label="Email" value={client.email} />
                {/* <DetailItem label="Preferred Contact" value={client.preferredContact} /> */}

                {/* Order/Project Details */}
                <DetailItem
                  label="Due Date"
                  value={client.dueDate ? new Date(client.dueDate).toLocaleDateString("en-GB") : 'N/A'}
                />
                <DetailItem
                  label="Wedding Date"
                  value={client.WeddingDate ? new Date(client.WeddingDate).toLocaleDateString("en-GB") : 'N/A'}
                />
                <DetailItem label="Fabric Type" value={client.fabricType} />
                <DetailItem label="Quoted Price" value={`$${client.price?.toLocaleString() || '0.00'}`} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measurements">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium" style={{ color: deepNavy }}>
                  Measurements
                </h3>
                <Button
                  variant="outline"
                  className="text-sm border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsMeasurementOpen(true)}
                >
                  Add Measurement
                </Button>
              </div>

              {/* Modals */}
              {isMeasurementOpen && (
                <AddMeasurementModal
                  clientId={client.id}
                  onClose={() => setIsMeasurementOpen(false)}
                />
              )}
              {editingMeasurement && (
                <AddMeasurementModal
                  clientId={client.id}
                  measurementToEdit={editingMeasurement}
                  onClose={() => setEditingMeasurement(null)}
                />
              )}

              {/* List all measurements */}
              {client.measurements && client.measurements.length > 0 ? (
                client.measurements.map((measurement) => (
                  <div key={measurement.id} className="mb-6 border-b pb-4">
                    <p className="text-gray-500 text-sm">
                      Recorded on: {new Date(measurement.date).toLocaleDateString("en-GB")}
                    </p>
                    <SingleMeasurementDisplay measurement={measurement} />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMeasurement(measurement)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No measurement records available.</p>
              )}
            </div>
          </TabsContent>

          {/* 3. NOTES Tab */}
          <TabsContent value="notes">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-medium mb-4" style={{ color: deepNavy }}>General Notes</h3>
              <div className="whitespace-pre-wrap text-gray-700">{client.notes || 'No general notes recorded for this client.'}</div>
            </div>
          </TabsContent>

          {/* 4. APPOINTMENTS Tab */}
          <TabsContent value="appointments">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {clientAppointments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No appointments scheduled</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {clientAppointments.map((apt) => (
                    <div key={apt.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg" style={{ color: deepNavy }}>{apt.service}</div>
                          <div className="text-gray-600">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </div>
                          {apt.notes && (
                            <div className="text-sm text-gray-500 mt-2">{apt.notes}</div>
                          )}
                        </div>
                        <Button variant="outline" className="text-sm border-gray-300 hover:bg-gray-50">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}