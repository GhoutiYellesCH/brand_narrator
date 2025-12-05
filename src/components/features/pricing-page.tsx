'use client';

import { Check, Bitcoin, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const tokenPackages = [
  {
    name: 'Starter Pack',
    tokens: 500,
    priceUSD: 10,
    description: 'Perfect for getting started and trying out the features.',
    features: [
      '500 AI Tokens',
      'Generate ~10 brand stories',
      'Generate ~100 AI prompts',
      'Basic Email Support',
    ],
    cta: 'Buy Tokens',
    popular: false,
  },
  {
    name: 'Creator Pack',
    tokens: 2500,
    priceUSD: 45,
    description: 'For creators and startups ready to build their brand.',
    features: [
      '2500 AI Tokens',
      'Generate ~50 brand stories',
      'Generate ~500 AI prompts',
      'All AI Features',
      'Priority Support',
    ],
    cta: 'Buy Tokens',
    popular: true,
  },
  {
    name: 'Agency Pack',
    tokens: 10000,
    priceUSD: 150,
    description: 'For agencies and power users with high-volume needs.',
    features: [
      '10,000 AI Tokens',
      'Unlimited Generations',
      'API Access (Coming Soon)',
      'Dedicated Support',
      'For multiple brands',
    ],
cta: 'Buy Tokens',
    popular: false,
  },
];

export function PricingPage() {

  const handlePayment = (packageName: string, price: number) => {
    // Placeholder for NOWPayments integration
    // You would typically call the NOWPayments API here to create an invoice
    alert(`Selected ${packageName} for $${price}. Redirecting to payment gateway... (placeholder)`);
    // Example: window.location.href = `https://nowpayments.io/invoice?invoice_id=YOUR_INVOICE_ID`
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-headline md:text-4xl">Purchase AI Tokens</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Power your brand narrative with AI. Tokens are used for all AI generation features. Pay with crypto or fiat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pt-4">
        {tokenPackages.map((plan) => (
          <Card
            key={plan.name}
            className={cn('flex flex-col', {
              'border-primary ring-2 ring-primary shadow-lg': plan.popular,
            })}
          >
            <CardHeader className="relative">
              {plan.popular && (
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardTitle className="font-headline">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="flex items-baseline gap-2 pt-4">
                <span className="text-4xl font-bold">${plan.priceUSD}</span>
                <span className="text-muted-foreground">/ {plan.tokens.toLocaleString()} Tokens</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePayment(plan.name, plan.priceUSD)}
              >
                <Diamond className="mr-2 h-4 w-4" />
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center text-muted-foreground text-sm pt-4 max-w-2xl space-y-2">
        <p className="flex items-center justify-center gap-2">
            <Bitcoin className="h-5 w-5" />
            <span>All payments are securely processed via NOWPayments. We accept major cryptocurrencies like USDT, BTC, ETH.</span>
        </p>
        <p>Tokens are valid for one year from the date of purchase and are non-refundable.</p>
      </div>
    </div>
  );
}

    