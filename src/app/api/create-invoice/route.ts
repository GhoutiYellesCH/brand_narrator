
import { NextRequest, NextResponse } from 'next/server';
import { auth as nextAuth } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
    price: z.coerce.number().positive('Price must be a positive number.'),
    packageName: z.string().min(1, 'Package name is required.'),
    tokens: z.coerce.number().int().positive('Tokens must be a positive integer.'),
});

export async function POST(request: NextRequest) {
    const session = await nextAuth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized: You must be logged in.' }, { status: 401 });
    }
    const userId = session.user.id;

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
            return NextResponse.json({ error: invoice.message || 'Failed to create payment invoice.' }, { status: response.status });
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
