"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/types";
import { measurementSchema } from "@/lib/validation/measurement";
import { ClientWithRelations } from "@/types";

interface EditClientModalProps {
    client: ClientWithRelations;
    onClose: () => void;
    onSave?: () => void; // optional callback
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
    }, [client.id]);


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

            router.refresh();

            if (onSave) onSave();
            onClose();
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
                <h3 className="text-lg font-medium mb-4">Edit Client Information</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Family Name</label>
                        <Input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <Input name="email" value={form.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <Input name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Due Date</label>
                        <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Wedding Date</label>
                        <Input type="date" name="WeddingDate" value={form.WeddingDate} onChange={handleChange} />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="text-xs font-semibold uppercase text-gray-400">Recommended By</label>
                        <Input name="Recommended" value={form.Recommended} onChange={handleChange} />
                    </div>
                    
            
                </div>

                <div className="mt-4">
                    <label className="text-sm text-gray-500">Notes</label>
                    <Textarea name="notes" value={form.notes} onChange={handleChange} />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save Family Info"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
