"use client";

import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { ClientProfileData } from './InformationTab';

// 1. ADD THIS IMPORT:
import { useModal } from "@/hooks/use-modal-store"; 

const deepNavy = '#1E2024';

// 2. REMOVED onBook from the props since we don't need the parent page to handle it anymore
interface ClientHeaderProps {
    client: ClientProfileData;
    onEdit: () => void;
}

export function ClientHeader({ client, onEdit }: ClientHeaderProps) {
    // 3. INITIALIZE THE HOOK
    const { onOpen } = useModal();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2
                        className="text-4xl font-light mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: deepNavy }}
                    >
                        {client.name}
                    </h2>
                    <p className="text-gray-500 mb-4">{client.email} | {client.phone}</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="text-sm border-gray-300 hover:bg-gray-50"
                        style={{ color: deepNavy }}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Information
                    </Button>
                    
                    {/* 4. UPDATE THIS BUTTON TO TRIGGER THE GLOBAL MODAL AND PASS THE CLIENT DATA */}
                    <Button
                        onClick={() => onOpen("bookAppointment", { 
                            initialData: { 
                                title: client.name, 
                                resource: { clientId: client.id } 
                            } 
                        })}
                        className="text-sm shadow-md transition hover:bg-opacity-90"
                        style={{ backgroundColor: deepNavy, color: 'white' }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                    </Button>
                </div>
            </div>
        </div>
    )
}