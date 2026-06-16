"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react"; // 1. Added checkmark
import { BaseModal } from "@/components/BaseModal"; // 2. Added BaseModal
import { ClientProfileData } from "@/types";

interface EditClientModalProps {
    client: ClientProfileData;
    onClose: () => void;
    onSave?: () => void;
}

export function EditClientModal({ client, onClose, onSave }: EditClientModalProps) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        dueDate: "",
        WeddingDate: "",
        notes: "",
        Recommended: "",
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // 3. Added success state

    // Prefill form on mount
    useEffect(() => {
        if (!client) return;

        setForm({
            name: client.name ?? "",
            phone: client.phone ?? "",
            email: client.email ?? "",
            dueDate: client.dueDate
                ? new Date(client.dueDate).toISOString().slice(0, 10)
                : "",
            WeddingDate: client.WeddingDate
                ? new Date(client.WeddingDate).toISOString().slice(0, 10)
                : "",
            Recommended: client.Recommended ?? "",
            notes: client.notes ?? "",
        });
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
                    WeddingDate: form.WeddingDate ? new Date(form.WeddingDate).toISOString() : undefined,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend error:", errorData);
                throw new Error(errorData.message || "Update failed");
            }

            // 4. Trigger success screen, wait 2 seconds, then execute close/refresh!
            setShowSuccess(true);
            setTimeout(() => {
                router.refresh();
                if (onSave) onSave();
                onClose();
            }, 2000);

        } catch (err: unknown) {
            console.error("Update error:", err);
            let message = "Failed to update client";
            if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // 5. Replaced messy HTML with BaseModal wrapper
        <BaseModal
            title={showSuccess ? "Success" : "Edit Client Information"}
            onClose={onClose}
        >
            {showSuccess ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="animate-bounce">
                        <CheckCircle2 className="h-20 w-20 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Information Updated!</h2>
                    <p className="text-gray-500 text-sm">The client's profile has been saved.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Family Name</label>
                                <Input name="name" value={form.name} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Email</label>
                                <Input name="email" value={form.email} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Phone</label>
                                <Input name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Due Date</label>
                                <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Wedding Date</label>
                                <Input type="date" name="WeddingDate" value={form.WeddingDate} onChange={handleChange} />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Recommended By</label>
                                <Input name="Recommended" value={form.Recommended} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Notes</label>
                            <Textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="bg-[#1E2024] text-white hover:opacity-90 shadow-sm"
                        >
                            {loading ? "Saving..." : "Save Family Info"}
                        </Button>
                    </div>
                </>
            )}
        </BaseModal>
    );
}