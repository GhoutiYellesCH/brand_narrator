'use client';

import { Check, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    priceMonthly: '$0',
    priceYearly: '$0',
    description: 'Get a taste of our platform, on us.',
    features: [
      '1 Brand Story Generation',
      '5 Social Media Posts/mo',
      'Basic Analytics',
      'Email Support',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    priceMonthly: '$49',
    priceYearly: '$490',
    description: 'For startups ready to scale their narrative.',
    features: [
      'Unlimited Brand Stories',
      'Unlimited Social Posts',
      'Advanced Analytics Dashboard',
      'AI Prompt Generator',
      'Priority Support',
      'Platform Integrations',
    ],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    description: 'Tailored solutions for established brands.',
    features: [
      'Everything in Pro',
      'Dedicated Account Manager',
      'Custom Integrations',
      'Team Collaboration Tools',
      'API Access',
      'White-labeling Options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handlePayment = (planName: string) => {
    if (planName === 'Enterprise') {
      // Redirect to a contact form or open mail client
      window.location.href = 'mailto:sales@brandnarrator.com';
    } else {
      // Placeholder for NOWPayments integration
      // You would typically call the NOWPayments API here
      alert(`Selected ${planName}. Redirecting to payment gateway... (placeholder)`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-headline md:text-4xl">Find the perfect plan</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Whether you're just starting or ready to scale, we have a plan that fits your brand's journey. Pay with crypto or fiat.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch id="billing-cycle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-cycle">Yearly (Save 20%)</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan) => (
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
                <span className="text-4xl font-bold">
                  {plan.name === 'Custom' ? 'Custom' : (isYearly ? `$${(parseInt(plan.price.substring(1)) * 10)}` : plan.price)}
                </span>
                <span className="text-muted-foreground">
                  {plan.name !== 'Custom' && (isYearly ? '/year' : '/month')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="font-semibold">Features include:</p>
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
                onClick={() => handlePayment(plan.name)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center text-muted-foreground text-sm pt-4">
        <p>All payments are securely processed. We accept major cryptocurrencies like USDT, BTC, ETH via NOWPayments.</p>
      </div>
    </div>
  );
}
