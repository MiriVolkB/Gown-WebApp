import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjust path if needed
import { ClientProfileData } from './InformationTab';

// Keep the local color variable
const deepNavy = '#1E2024';

interface ClientHeaderProps {
    client: ClientProfileData;
    onEdit: () => void;
    onBook: () => void;
}

export function ClientHeader({ client, onEdit, onBook }: ClientHeaderProps) {
    return (
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
                        onClick={onEdit}
                        className="text-sm border-gray-300 hover:bg-gray-50"
                        style={{ color: deepNavy }}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Information
                    </Button>
                    {/* Book Appointment Button - Deep Navy background, white text */}
                    <Button
                        onClick={onBook}
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
