import { X } from "lucide-react";
import { ReactNode } from "react";

interface BaseModalProps {
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"; // Added 2xl!
}

export function BaseModal({
    onClose,
    title,
    subtitle,
    children,
    maxWidth = "md"
}: BaseModalProps) {

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl", // The new size for the Add Client form
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className={`bg-white rounded-2xl w-full ${maxWidthClasses[maxWidth]} shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col`}>

                {/* UPDATED HEADER: Sticky, bordered, and 2xl font! */}
                <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-serif font-medium text-[#1E2024]">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-sm text-slate-500 italic mt-1">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors -mr-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* MODAL CONTENT */}
                <div className="p-8">
                    {children}
                </div>

            </div>
        </div>
    );
}