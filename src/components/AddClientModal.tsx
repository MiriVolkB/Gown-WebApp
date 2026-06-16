"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, CheckCircle2 } from "lucide-react"; // Removed X
import { CreateClientSchema } from "@/lib/validation/client.schema";
import { BaseModal } from "@/components/BaseModal"; // IMPORT THE WRAPPER

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

type NewClientFormData = z.infer<typeof CreateClientSchema>;

export function AddClientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(CreateClientSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      Recommended: "",
      WeddingDate: "",
      dueDate: "",
      projects: [{ memberName: "", orderType: "RENTAL", price: 2000 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const handleTypeChange = (index: number, type: 'RENTAL' | 'CUSTOM_MAKE_RENTAL') => {
    let defaultPrice = 2000;
    if (type === 'CUSTOM_MAKE_RENTAL') {
      defaultPrice = 2500;
    } 
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
        setShowSuccess(true); 
        router.refresh();
        setTimeout(() => {
          onClose();
          router.push("/clients");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    // USE THE WRAPPER WITH maxWidth="2xl"
    <BaseModal
      title={showSuccess ? "Successfully Created!" : "New Client"}
      onClose={onClose}
      maxWidth="2xl" 
    >
      {showSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="animate-bounce">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />
          </div>
          <p className="text-slate-500">The client folder has been added to your list.</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Client Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Client name"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        const projects = form.getValues("projects");
                        if (projects.length === 1) {
                          form.setValue("projects.0.memberName", value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone<span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="tel" placeholder="050-000-0000" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="WeddingDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Wedding Date</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Need Gown By<span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Gown Details / Projects */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1E2024]" style={{ fontFamily: "'Playfair Display', serif" }}>Gown Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ memberName: "", orderType: "RENTAL", price: 2000 })}
                  className="text-slate-700 border-slate-300 hover:bg-slate-50"
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
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            onChange={(e) => handleTypeChange(index, e.target.value as any)}
                          >
                            <option value="RENTAL">Rental</option>
                            <option value="CUSTOM_MAKE_RENTAL">Custom Made Rental</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`projects.${index}.price`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₪)</FormLabel>
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

            {/* Changed the bottom border spacing slightly so it feels balanced */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-[#1E2024] px-8 text-white hover:opacity-90">
                {loading ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </BaseModal>
  );
}