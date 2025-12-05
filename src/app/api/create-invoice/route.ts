
import { NextRequest, NextResponse } from 'next/server';
import { getFirebase } from '@/firebase/server';
import { z } from 'zod';

const { auth: adminAuth } = getFirebase();

const CreateInvoiceSchema = z.object({
    price: z.coerce.number().positive('Price must be a positive number.'),
    packageName: z.string().min(1, 'Package name is required.'),
    tokens: z.coerce.number().int().positive('Tokens must be a positive integer.'),
});

async function getUserIdFromIdToken(idToken: string): Promise<string | null> {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying ID token in API route:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const userId = await getUserIdFromIdToken(idToken);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    let reqBody;
    try {
        reqBody = await request.json();
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const validatedFields = CreateInvoiceSchema.safeParse(reqBody);

    if (!validatedFields.success) {
        return NextResponse.json({ error: 'Invalid invoice data provided.', details: validatedFields.error.flatten().fieldErrors }, { status: 400 });
    }

    const { price, packageName, tokens } = validatedFields.data;

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
            return NextResponse.json({ error: invoice.message || 'Failed to create payment invoice.' }, { status: 500 });
        }

        if (invoice.invoice_url) {
            return NextResponse.json({ invoiceUrl: invoice.invoice_url });
        } else {
            return NextResponse.json({ error: 'Failed to retrieve invoice URL from payment provider.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error creating NOWPayments invoice:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred during payment processing.' }, { status: 500 });
    }
}
