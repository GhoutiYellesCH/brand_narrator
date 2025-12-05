
import { NextRequest, NextResponse } from 'next/server';
import { getFirebase } from '@/firebase/server';
import { cookies } from 'next/headers';

const { auth: adminAuth } = getFirebase();

async function getUserIdFromServerSession(): Promise<string | null> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) {
            console.log('API Route: Session cookie not found.');
            return null;
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        console.error('API Route: Error verifying session cookie:', error);
        return null;
    }
}


export async function POST(request: NextRequest) {
  const userId = await getUserIdFromServerSession();
  
  if (!userId) {
    return NextResponse.json({ message: 'You must be logged in to create an invoice.' }, { status: 401 });
  }

  const { price, packageName, tokens } = await request.json();

  if (typeof price !== 'number' || typeof packageName !== 'string' || typeof tokens !== 'number') {
    return NextResponse.json({ message: 'Invalid invoice data provided.' }, { status: 400 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    console.error('NOWPayments API key is not configured.');
    return NextResponse.json({ message: 'Payment service is not configured. Please contact support.' }, { status: 500 });
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
      return NextResponse.json({ message: errorBody.message || 'Failed to create payment invoice.' }, { status: response.status });
    }

    const invoice = await response.json();
    
    if (invoice.invoice_url) {
      return NextResponse.json({ invoiceUrl: invoice.invoice_url });
    } else {
      return NextResponse.json({ message: 'Failed to retrieve invoice URL from payment provider.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred during payment processing.' }, { status: 500 });
  }
}
