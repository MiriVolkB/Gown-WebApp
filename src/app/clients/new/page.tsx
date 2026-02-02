"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react"; // Icons for UI

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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Zod Schema ---
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
  })).min(1), // At least one gown is required
});

type NewClientFormData = z.infer<typeof newClientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
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
      // New Project Fields
      projects: [{ memberName: "Main", orderType: "RENTAL", price: 1800 }], // Default one gown
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });



  // Helper to handle price logic for specific rows
  const handleTypeChange = (index: number, type: 'RENTAL' | 'CUSTOM_MAKE') => {
    const defaultPrice = type === 'CUSTOM_MAKE' ? 3000 : 1800;
    form.setValue(`projects.${index}.orderType`, type);
    form.setValue(`projects.${index}.price`, defaultPrice);
  };

  const onSubmit = async (data: NewClientFormData) => {
    setLoading(true);
    setSubmitted(false);

    try {
      // Convert dates to Date objects for Prisma
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

      if (!res.ok) throw new Error("Failed to create client");

      setSubmitted(true);
      form.reset();
      router.push("/clients");
    } catch (err) {
      console.error(err);
      alert("Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h3 className="text-3xl font-serif text-slate-900 mb-3 border-b border-slate-50 pb-2">
                Create New Client
              </h3>
      

      {submitted && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          Client created successfully!
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Name */}
              <FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input 
          placeholder="Enter full name" 
          {...field} 
          onChange={(e) => {
            const value = e.target.value;
            // 1. Update the main Name field
            field.onChange(value); 
            
            // 2. Manually sync the first gown's memberName
            // We check if it's the only project and if it's "clean"
            const projects = form.getValues("projects");
            if (projects.length === 1) {
              form.setValue("projects.0.memberName", value);
            }
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Optional email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Wedding Date */}
              <FormField
                control={form.control}
                name="WeddingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Date</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Need Gown By */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Need Gown By</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recommended */}
              <FormField
                control={form.control}
                name="Recommended"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended by</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 text-lg">Gown Details</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ memberName: "", orderType: "RENTAL", price: 1800 })}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Family Member
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="relative space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
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

                <FormField
                  control={form.control}
                  name={`projects.${index}.memberName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who is this gown for?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sarah / Bride" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`projects.${index}.orderType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            onChange={(e) => handleTypeChange(index, e.target.value as any)}
                          >
                            <option value="RENTAL">Rental</option>
                            <option value="CUSTOM_MAKE">Custom Make</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`projects.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (NIS)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/clients")}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
