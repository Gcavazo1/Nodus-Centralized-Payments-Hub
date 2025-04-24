"use client";

import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the Zod schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(), // Keep phone optional for now
});

type CustomerInfoFormValues = z.infer<typeof formSchema>;

// Define the expected props
interface CustomerInfoFormProps {
  onSubmit: (info: CustomerInfoFormValues) => void;
}

export function CustomerInfoForm({ onSubmit }: CustomerInfoFormProps) {
  // 1. Define form using react-hook-form and the Zod schema
  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // 2. Define the submit handler
  function processSubmit(values: CustomerInfoFormValues) {
    // This function will be called by form.handleSubmit only if validation succeeds
    onSubmit(values); // Pass validated data to the parent component
  }

  return (
    <Form {...form}>
      {/* Use the form.handleSubmit function */}
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }: { field: ControllerRenderProps<CustomerInfoFormValues, 'name'> }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<CustomerInfoFormValues, 'email'> }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }: { field: ControllerRenderProps<CustomerInfoFormValues, 'phone'> }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your phone number" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Continue to Payment
        </Button>
      </form>
    </Form>
  );
} 