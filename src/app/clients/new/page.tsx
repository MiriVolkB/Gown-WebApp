"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, CheckCircle2 } from "lucide-react"; 
import { CreateClientSchema } from "@/lib/validation/client.schema"; 

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

type NewClientFormData = z.infer<typeof CreateClientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Added for success view

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(CreateClientSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      Recommended: "",
      WeddingDate: "",
      dueDate: "",
      projects: [{ memberName: "Main", orderType: "RENTAL", price: 1800 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const handleTypeChange = (index: number, type: 'RENTAL' | 'CUSTOM_MAKE' | 'CUSTOM_MAKE_RENTAL') => {
    let defaultPrice = 1800;
    if (type === 'CUSTOM_MAKE') defaultPrice = 3000;
    if (type === 'CUSTOM_MAKE_RENTAL') defaultPrice = 2500;

    form.setValue(`projects.${index}.orderType`, type, { shouldValidate: true });
    form.setValue(`projects.${index}.price`, defaultPrice, { shouldValidate: true });
  };

  const onSubmit = async (data: NewClientFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
        WeddingDate: data.WeddingDate ? new Date(data.WeddingDate).toISOString() : null,
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create client");

      // --- Success Logic ---
      setShowSuccess(true);
      router.refresh();

      setTimeout(() => {
        router.push("/clients");
      }, 2000);
      // ---------------------

    } catch (err) {
      console.error(err);
      alert("Error creating client");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h3 className="text-3xl font-serif text-slate-900 mb-6 border-b border-slate-100 pb-2">
        Create New Client
      </h3>

      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          {showSuccess ? (
            /* Success View */
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif text-slate-900 mb-2">Client Created!</h2>
              <p className="text-slate-500">Redirecting you to the client list...</p>
            </div>
          ) : (
            /* Form View */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter full name" 
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
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="050-000-0000" {...field} />
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

                <div className="grid grid-cols-2 gap-4">
                    {/* Wedding Date */}
                    <FormField
                    control={form.control}
                    name="WeddingDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Wedding Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""}/>
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
                        <FormLabel>Need Gown By<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

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

                <div className="space-y-4 pt-4">
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
                                  <option value="CUSTOM_MAKE">Custom Made To keep</option>
                                  <option value="CUSTOM_MAKE_RENTAL">Custom Made Rental</option>
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

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/clients")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white hover:bg-slate-800">
                    {loading ? "Creating..." : "Create Client"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}