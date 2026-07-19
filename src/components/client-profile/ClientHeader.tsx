"use client";

import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { ClientProfileData } from './InformationTab';
import { useModal } from "@/hooks/use-modal-store"; 

const deepNavy = '#1E2024';

interface ClientHeaderProps {
    client: ClientProfileData;
    onEdit: () => void;
    onDelete: () => void;
}

export function ClientHeader({ client, onEdit, onDelete }: ClientHeaderProps) {
    const { onOpen } = useModal();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-8 shadow-sm mb-8">
            {/* THE FIX: Added flex-wrap here so they automatically drop down when squished */}
            <div className="flex flex-wrap items-start md:items-center justify-between gap-4">
                
                {/* Name & Info */}
                <div className="w-full sm:w-auto">
                    <h2
                        className="text-3xl md:text-4xl font-light mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: deepNavy }}
                    >
                        {client.name}
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">{client.email} | {client.phone}</p>
                </div>

                {/* THE FIX: Added flex-wrap here too, so the buttons themselves can stack if needed */}
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="flex-1 sm:flex-none text-sm border-gray-300 hover:bg-gray-50"
                        style={{ color: deepNavy }}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Information
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onDelete}
                        className="flex-1 sm:flex-none text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Folder
                    </Button>
                    
                    <Button
                        onClick={() => onOpen("bookAppointment", { 
                            initialData: { 
                                title: client.name, 
                                resource: { clientId: client.id } 
                            } 
                        })}
                        className="flex-1 sm:flex-none text-sm shadow-md transition hover:bg-opacity-90"
                        style={{ backgroundColor: deepNavy, color: 'white' }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                    </Button>
                </div>
            </div>
        </div>
    );
}