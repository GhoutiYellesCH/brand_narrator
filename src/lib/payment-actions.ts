'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getFirebase } from '@/firebase/server';

const { auth: adminAuth } = getFirebase();

async function getUserIdFromServerSession(): Promise<string | null> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) {
            console.log('Session cookie not found.');
            return null;
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying session cookie in server action:', error);
        return null;
    }
}


const CreateInvoiceSchema = z.object({
  price: z.coerce.number().positive(),
  packageName: z.string().min(1),
  tokens: z.coerce.number().int().positive(),
});

export async function createAndRedirectToNowPaymentsInvoice(formData: FormData) {
  const userId = await getUserIdFromServerSession();

  if (!userId) {
    throw new Error('You must be logged in to create an invoice.');
  }

  const validatedFields = CreateInvoiceSchema.safeParse({
    price: formData.get('price'),
    packageName: formData.get('packageName'),
    tokens: formData.get('tokens'),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid invoice data provided.');
  }

  const { price, packageName, tokens } = validatedFields.data;

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
      }),
    });

    const invoice = await response.json();

    if (!response.ok) {
      console.error('NOWPayments API Error:', invoice);
      throw new Error(invoice.message || 'Failed to create payment invoice.');
    }

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
