
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getFirebase } from '@/firebase/server';

const { auth: adminAuth } = getFirebase();

const CreateInvoiceSchema = z.object({
  price: z.number(),
  packageName: z.string(),
  tokens: z.number(),
  idToken: z.string().min(1, 'ID token is required.'),
});


async function getUserIdFromIdToken(idToken: string): Promise<string | null> {
    if (!idToken) {
      return null;
    }
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken.uid;
    } catch (error) {
      console.error('Server Action: Error verifying ID token:', error);
      return null;
    }
}


export async function createAndRedirectToNowPaymentsInvoice(
  formData: FormData
) {
  
  const validatedFields = CreateInvoiceSchema.safeParse({
    price: parseFloat(formData.get('price') as string),
    packageName: formData.get('packageName') as string,
    tokens: parseInt(formData.get('tokens') as string, 10),
    idToken: formData.get('idToken') as string,
  });

  if (!validatedFields.success) {
    console.error('Invalid invoice data:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Invalid invoice data provided.');
  }
  
  const { price, packageName, tokens, idToken } = validatedFields.data;

  const userId = await getUserIdFromIdToken(idToken);
  if (!userId) {
    throw new Error('You must be logged in to create an invoice.');
  }
  
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    console.error('NOWPayments API key is not configured.');
    throw new Error('Payment service is not configured. Please contact support.');
  }

  try {
    const orderId = `${userId}-${Date.now()}`;
    const nowPaymentsApiUrl = 'https://api.nowpayments.io/v1/invoice';

    const response = await fetch(nowPaymentsApiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `${packageName} - ${tokens} Tokens for user ${userId}`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=cancelled`,
        // IPN is handled in a separate API route.
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('NOWPayments API Error:', errorBody);
      throw new Error(errorBody.message || 'Failed to create payment invoice.');
    }

    const invoice = await response.json();
    
    if (invoice.invoice_url) {
      redirect(invoice.invoice_url);
    } else {
        throw new Error('Failed to retrieve invoice URL from payment provider.');
    }
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    throw new Error(error.message || 'An unexpected error occurred during payment processing.');
  }
}
