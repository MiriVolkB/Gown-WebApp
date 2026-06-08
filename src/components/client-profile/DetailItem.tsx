"use client";
import { useState } from "react";
import { Check, X, Edit2 } from 'lucide-react';

const deepNavy = '#1E2024';

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  field?: string;
  type?: 'text' | 'email' | 'date';
  editable?: boolean;
  onSave?: (field: string, value: string) => Promise<void>;
}

export function DetailItem({
  label,
  value,
  field,
  type = 'text',
  editable = false,
  onSave
}: DetailItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    let initialValue = value?.toString() || '';
    if (type === 'date' && value && typeof value === 'string') {
      // Convert display date back to ISO format for input
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        initialValue = date.toISOString().split('T')[0];
      }
    }
    setEditValue(initialValue);
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
    let initialValue = value?.toString() || '';
    if (type === 'date' && value && typeof value === 'string') {
      // Convert display date back to ISO format for input
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        initialValue = date.toISOString().split('T')[0];
      }
    }
    setEditValue(initialValue);
    setIsEditing(false);
  };

  return (
    <div className="group">
      <div className="text-sm mb-1" style={{ color: 'gray' }}>
        {label}
      </div>
      <div className="font-medium flex items-center gap-1" style={{ color: deepNavy }}>
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
                className="flex-shrink-0 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <Edit2 className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}