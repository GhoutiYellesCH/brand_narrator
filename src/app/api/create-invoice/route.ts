
import { NextRequest, NextResponse } from 'next/server';
import { getFirebase } from '@/firebase/server';

const { auth: adminAuth } = getFirebase();

async function getUserIdFromIdToken(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        console.error('API Route: Authorization header missing or malformed.');
        return null;
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error('API Route: Error verifying ID token:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    const userId = await getUserIdFromIdToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'You must be logged in to create an invoice.' }, { status: 401 });
    }

    const { price, packageName, tokens } = await request.json();

    if (!price || !packageName || !tokens) {
        return NextResponse.json({ error: 'Missing required invoice data.' }, { status: 400 });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
        console.error('NOWPayments API key is not configured.');
        return NextResponse.json({ error: 'Payment service is not configured. Please contact support.' }, { status: 500 });
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
            return NextResponse.json({ invoiceUrl: invoice.invoice_url });
        } else {
            throw new Error('Failed to retrieve invoice URL from payment provider.');
        }
    } catch (error: any) {
        console.error('Error creating NOWPayments invoice:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred during payment processing.' }, { status: 500 });
    }
}
