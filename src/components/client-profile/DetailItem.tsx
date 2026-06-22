"use client";

import React, { useState, useEffect } from 'react';
import { Edit2, X, Check } from 'lucide-react';

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  rawValue?: any; // Used to safely pass raw date objects/strings for the input
  field?: string;
  type?: 'text' | 'email' | 'date';
  editable?: boolean;
  onSave?: (field: string, value: string) => Promise<void>;
}

export function DetailItem({ 
  label, 
  value, 
  rawValue,
  field, 
  type = 'text', 
  editable = false, 
  onSave 
}: DetailItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // When opening the modal, set the input value correctly
  useEffect(() => {
    if (isEditing) {
      if (type === 'date' && rawValue) {
        // HTML date inputs require strictly YYYY-MM-DD format
        const dateObj = new Date(rawValue);
        if (!isNaN(dateObj.getTime())) {
          setEditValue(dateObj.toISOString().split('T')[0]);
        } else {
          setEditValue('');
        }
      } else {
        setEditValue(rawValue?.toString() || value?.toString() || '');
      }
    }
  }, [isEditing, rawValue, value, type]);

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

  return (
    <div className="group relative flex flex-col border-b border-slate-100 pb-3">
      {/* 1. READ-ONLY VIEW */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
          <p className="text-lg font-medium text-slate-900">
            {value || '--'}
          </p>
        </div>

        {editable && (
          <button 
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 2. POP-UP MODAL (OVERLAY) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          
          {/* Modal Card */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Edit {label}</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={saving}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
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
      )}
    </div>
  );
}