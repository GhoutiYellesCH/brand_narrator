
'use server';

import { z } from 'zod';
import { getFirebase } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

// NOWPayments Integration Action
const CreateInvoiceSchema = z.object({
  price: z.number(),
  packageName: z.string(),
  tokens: z.number(),
});

export async function createAndRedirectToNowPaymentsInvoice(
  formData: FormData
) {
  const userId = await getUserIdFromServerSession();
  if (!userId) {
    // This should ideally redirect to a login page with an error
    // For now, we'll throw an error which will be caught by an error boundary.
    throw new Error('You must be logged in to create an invoice.');
  }

  const validatedFields = CreateInvoiceSchema.safeParse({
    price: parseFloat(formData.get('price') as string),
    packageName: formData.get('packageName') as string,
    tokens: parseInt(formData.get('tokens') as string, 10),
  });

  if (!validatedFields.success) {
    throw new Error('Invalid invoice data.');
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
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments-ipn`,
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
    // In a real app, you might want to redirect to an error page
    throw new Error(error.message || 'An unexpected error occurred during payment processing.');
  }
}
