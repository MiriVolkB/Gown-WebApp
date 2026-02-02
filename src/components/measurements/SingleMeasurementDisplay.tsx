"use client";

import React from 'react';
import { Measurement } from '@/types';

const deepNavy = '#1E2024';

// Helper inside the file to keep it self-contained
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-sm mb-1 text-gray-500 uppercase tracking-tight font-medium">{label}</div>
    <div className="font-semibold text-lg" style={{ color: deepNavy }}>{value}</div>
  </div>
);

export function SingleMeasurementDisplay({ measurement }: { measurement: Measurement }) {
  const formatValue = (value: number | undefined) => (value !== undefined ? `${value} cm` : 'N/A');

  return (
    <div className="space-y-6">
      <hr className="border-t border-slate-100" />
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8 py-2">
        <DetailItem label="Bust" value={formatValue(measurement.Bust)} />
        <DetailItem label="Waist" value={formatValue(measurement.waist)} />
        <DetailItem label="Hips" value={formatValue(measurement.Hips)} />

        <DetailItem label="Shoulder to Bust" value={formatValue(measurement.ShoulderToBust)} />
        <DetailItem label="Sleeve Length" value={formatValue(measurement.SleeveLength)} />
        <DetailItem label="Sleeve Width" value={formatValue(measurement.SleeveWidth)} />

        <DetailItem label="Shirt Length" value={formatValue(measurement.ShirtLength)} />
        <DetailItem label="Skirt Length" value={formatValue(measurement.SkirtLength)} />

        <div className="col-span-2">
          <DetailItem label="Tailor Notes" value={measurement.notes || 'None'} />
        </div>
      </div>
    </div>
  );
}