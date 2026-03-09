"use client";

import React, { useState } from 'react';
import { Measurement } from '@/types';
import { Edit2, Check, X } from 'lucide-react';

const deepNavy = '#1E2024';

// Enhanced DetailItem with inline editing
const DetailItem = ({ 
  label, 
  value, 
  field,
  type = 'text',
  editable = false,
  onSave 
}: { 
  label: string; 
  value: React.ReactNode;
  field?: string;
  type?: 'text' | 'number';
  editable?: boolean;
  onSave?: (field: string, value: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!onSave || !field) return;
    setSaving(true);
    try {
      await onSave(field, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  return (
    <div className="group">
      <div className="text-sm mb-1 text-gray-500 uppercase tracking-tight font-medium">
        {label}
      </div>
      <div className="font-semibold text-lg flex items-center gap-1" style={{ color: deepNavy }}>
        {isEditing ? (
          <>
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={saving}
            />
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-6 h-6 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <Check className="h-3 w-3 text-green-600" />
            </button>
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <X className="h-3 w-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1">{value}</span>
            {editable && (
              <button 
                onClick={handleEdit}
                className="flex-shrink-0 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export function SingleMeasurementDisplay({ 
  measurement, 
  onSave 
}: { 
  measurement: Measurement;
  onSave?: (field: string, value: string) => Promise<void>;
}) {
  const formatValue = (value: number | undefined) => (value !== undefined ? `${value} cm` : 'N/A');

  return (
    <div className="space-y-6">
      <hr className="border-t border-slate-100" />
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8 py-2">
        <DetailItem 
          label="Bust" 
          value={formatValue(measurement.Bust)} 
          field="Bust"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />
        <DetailItem 
          label="Waist" 
          value={formatValue(measurement.waist)} 
          field="waist"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />
        <DetailItem 
          label="Hips" 
          value={formatValue(measurement.Hips)} 
          field="Hips"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />

        <DetailItem 
          label="Shoulder to Bust" 
          value={formatValue(measurement.ShoulderToBust)} 
          field="ShoulderToBust"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />
        <DetailItem 
          label="Sleeve Length" 
          value={formatValue(measurement.SleeveLength)} 
          field="SleeveLength"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />
        <DetailItem 
          label="Sleeve Width" 
          value={formatValue(measurement.SleeveWidth)} 
          field="SleeveWidth"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />

        <DetailItem 
          label="Shirt Length" 
          value={formatValue(measurement.ShirtLength)} 
          field="ShirtLength"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />
        <DetailItem 
          label="Skirt Length" 
          value={formatValue(measurement.SkirtLength)} 
          field="SkirtLength"
          type="number"
          editable={!!onSave}
          onSave={onSave}
        />

        <div className="col-span-2">
          <DetailItem 
            label="Tailor Notes" 
            value={measurement.notes || 'None'} 
            field="notes"
            editable={!!onSave}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}