"use client";

import React, { useState, useEffect } from 'react';
import { Measurement } from "@prisma/client";
import { Edit2, Check, X } from 'lucide-react';

const MeasurementDetailItem = ({ 
  label, 
  value, 
  field,
  type = 'text',
  editable = false,
  suffix = '',
  variant = 'default',
  onSave 
}: { 
  label: string; 
  value: string | number | undefined | null;
  field?: string;
  type?: 'text' | 'number';
  editable?: boolean;
  suffix?: string;
  variant?: 'default' | 'notes';
  onSave?: (field: string, value: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  
  // NEW: Local state for instant "Optimistic UI" updates and success message
  const [localValue, setLocalValue] = useState(value);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync localValue if the actual database value changes behind the scenes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Sync the edit input when the modal opens
  useEffect(() => {
    if (isEditing) {
      setEditValue(localValue?.toString() || '');
    }
  }, [isEditing, localValue]);

  const handleSave = async () => {
    if (!onSave || !field) return;
    setSaving(true);
    try {
      await onSave(field, editValue);
      setLocalValue(editValue); // Instantly update the UI!
      setIsEditing(false);
      
      // Show the success badge for 2 seconds
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  // The unified Modal Overlay
  const ModalOverlay = isEditing && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Edit {label}</h3>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {label} {variant === 'default' && suffix && `(${suffix.trim()})`}
            </label>
            
            {variant === 'notes' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={saving}
                autoFocus
                className="w-full px-4 py-3 min-h-[120px] bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
              />
            ) : (
              <div className="relative">
                <input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={saving}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans"
                />
                {suffix && (
                  <span className="absolute right-4 top-[11px] text-slate-400 font-medium pointer-events-none">
                    {suffix.trim()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Check className="h-4 w-4" /> Save
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  // Read-Only Layout for Tailor Notes
  if (variant === 'notes') {
    return (
      <>
        <div className="group flex flex-col p-5 bg-blue-50/30 rounded-xl border border-blue-100/50 relative col-span-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">
              {label}
            </span>
            {/* Success Badge OR Edit Button */}
            {showSuccess ? (
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded animate-in fade-in slide-in-from-bottom-1 shrink-0">
                Saved!
              </span>
            ) : editable ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-8 h-8 bg-blue-100/50 hover:bg-blue-200 text-blue-500 rounded-full flex items-center justify-center"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {localValue || "No additional notes provided for this fitting."}
          </p>
        </div>
        {ModalOverlay}
      </>
    );
  }

  // Read-Only Layout for Standard Number Measurements
  return (
    <>
      <div className="group flex flex-col p-3 sm:p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors relative min-h-[88px] h-full justify-between gap-2 overflow-hidden">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-tight break-words pr-6">
            {label}
          </span>
          
          {/* Success Badge OR Edit Button */}
          {showSuccess ? (
            <span className="absolute right-2 top-2 text-[9px] uppercase font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded shadow-sm animate-in fade-in slide-in-from-top-1 z-10">
              Saved!
            </span>
          ) : editable ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 w-7 h-7 bg-white shadow-sm border border-slate-100 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center z-10"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          ) : null}
        </div>
        
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-2xl font-serif text-slate-900">
            {localValue !== undefined && localValue !== null && localValue !== '' ? localValue : '--'}
          </span>
          {localValue !== undefined && localValue !== null && localValue !== '' && suffix && (
            <span className="text-sm font-medium text-slate-400">{suffix.trim()}</span>
          )}
        </div>
      </div>
      {ModalOverlay}
    </>
  );
};

export function SingleMeasurementDisplay({ 
  measurement, 
  onSave 
}: { 
  measurement: Measurement;
  onSave?: (field: string, value: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <MeasurementDetailItem label="Bust" value={measurement.Bust} field="Bust" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Waist" value={measurement.waist} field="waist" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Hips" value={measurement.Hips} field="Hips" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Shoulder to Bust" value={measurement.ShoulderToBust} field="ShoulderToBust" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Sleeve Length" value={measurement.SleeveLength} field="SleeveLength" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Sleeve Width" value={measurement.SleeveWidth} field="SleeveWidth" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Shirt Length" value={measurement.ShirtLength} field="ShirtLength" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
        <MeasurementDetailItem label="Skirt Length" value={measurement.SkirtLength} field="SkirtLength" type="number" suffix=" cm" editable={!!onSave} onSave={onSave} />
      </div>

      <MeasurementDetailItem 
        label="Tailor Notes" 
        value={measurement.notes} 
        field="notes"
        type="text"
        variant="notes"
        editable={!!onSave}
        onSave={onSave}
      />
    </div>
  );
}