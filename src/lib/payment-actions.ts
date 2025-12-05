
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

// This is a client-facing server action. It will now delegate the secure
// invoice creation to a dedicated API route.

const CreateInvoiceSchema = z.object({
  price: z.number(),
  packageName: z.string(),
  tokens: z.number(),
});

export async function createAndRedirectToNowPaymentsInvoice(
  formData: FormData
) {
  const validatedFields = CreateInvoiceSchema.safeParse({
    price: parseFloat(formData.get('price') as string),
    packageName: formData.get('packageName') as string,
    tokens: parseInt(formData.get('tokens') as string, 10),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid invoice data.');
  }

  const { price, packageName, tokens } = validatedFields.data;
  
  // The fetch call now uses an absolute URL, which is best practice when a server action
  // calls an API route. The NEXT_PUBLIC_BASE_URL must be set in your environment.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("Application base URL is not configured. Cannot create payment invoice.");
  }

  try {
    const response = await fetch(`${baseUrl}/api/nowpayments-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price, packageName, tokens }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || 'Failed to create payment invoice.');
    }

    const { invoiceUrl } = await response.json();

    if (invoiceUrl) {
      redirect(invoiceUrl);
    } else {
      throw new Error('Failed to retrieve invoice URL from the server.');
    }
  } catch (error: any) {
    console.error('Error in server action when calling invoice API:', error);
    // Re-throw the error to be handled by the UI
    throw new Error(error.message || 'An unexpected error occurred during payment processing.');
  }
}
