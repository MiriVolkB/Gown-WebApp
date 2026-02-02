"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const newClientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  Recommended: z.string().optional(),
  WeddingDate: z.string().optional(),
  dueDate: z.string().min(1, "Need Gown By date is required"),
  projects: z.array(z.object({
    memberName: z.string().min(1, "Member name is required"),
    orderType: z.enum(["RENTAL", "CUSTOM_MAKE"]),
    price: z.number().min(0),
  })).min(1),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

export function AddClientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: "", 
      phone: "", 
      email: "", 
      notes: "", 
      Recommended: "", 
      WeddingDate: "", 
      dueDate: "",
      projects: [{ memberName: "", orderType: "RENTAL", price: 1800 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  // Helper from your original page
  const handleTypeChange = (index: number, type: 'RENTAL' | 'CUSTOM_MAKE') => {
    const defaultPrice = type === 'CUSTOM_MAKE' ? 3000 : 1800;
    form.setValue(`projects.${index}.orderType`, type);
    form.setValue(`projects.${index}.price`, defaultPrice);
  };

  const onSubmit = async (data: NewClientFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        dueDate: new Date(data.dueDate),
        WeddingDate: data.WeddingDate ? new Date(data.WeddingDate) : null,
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onClose();
        router.refresh();
        router.push("/clients");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif text-slate-900">New Client Entry</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Client Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="e.g. Bokerman" 
                            {...field} 
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                const projects = form.getValues("projects");
                                if (projects.length === 1 && !projects[0].memberName) {
                                    form.setValue("projects.0.memberName", e.target.value);
                                }
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="050-000-0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="Recommended" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended By</FormLabel>
                    <FormControl><Input placeholder="Who sent them?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="WeddingDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Need Gown By</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Gown Details / Projects */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 font-serif">Gown Details</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ memberName: "", orderType: "RENTAL", price: 1800 })}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Member
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="relative space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <FormField control={form.control} name={`projects.${index}.memberName`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who is this gown for?</FormLabel>
                        <FormControl><Input placeholder="e.g. Bride / Sarah" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name={`projects.${index}.orderType`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Type</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                              onChange={(e) => handleTypeChange(index, e.target.value as any)}
                            >
                              <option value="RENTAL">Rental</option>
                              <option value="CUSTOM_MAKE">Custom Make</option>
                            </select>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`projects.${index}.price`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (NIS)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="Specific requests or measurements info..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-slate-900 px-8 text-white hover:bg-slate-800">
                  {loading ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}