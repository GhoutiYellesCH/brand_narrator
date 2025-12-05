
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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
  
  try {
    // When a server action calls an API route, it should use a relative path.
    // The 'fetch' call also needs to forward the cookies to the API route so the
    // user's session can be verified.
    const response = await fetch('/api/nowpayments-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies().toString(), // Forward cookies to the API route
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
