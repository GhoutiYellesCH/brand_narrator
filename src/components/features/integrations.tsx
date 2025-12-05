'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const integrationsList = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync your brand story and content with your HubSpot CRM.',
    logo: <HubSpotLogo />,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate your brand narrative into your sales process.',
    logo: <SalesforceLogo />,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Use your brand story in your email marketing campaigns.',
    logo: <MailchimpLogo />,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications about content performance and schedules.',
    logo: <SlackLogo />,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Gain deeper insights by connecting with Google Analytics.',
    logo: <GoogleAnalyticsLogo />,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect BrandNarrator to thousands of other apps with Zapier.',
    logo: <ZapierLogo />,
  },
];

function HubSpotLogo() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-[#FF7A59]">
      <path d="M12 0A12 12 0 1 0 24 12 12 12 0 0 0 12 0zm-2.09 16.32a.84.84 0 0 1-1.18-.3L6.6 12.8a.84.84 0 0 1 .28-1.18l3.1-2.1a.84.84 0 0 1 1.18.3L13.3 13.1a.84.84 0 0 1-.28 1.18l-3.1 2.04zm5.55-2.58a.84.84 0 0 1-1.18-.3L12.15 10a.84.84 0 0 1 .28-1.18l3.1-2.1a.84.84 0 0 1 1.18.3l2.13 3.25a.84.84 0 0 1-.28 1.18l-3.1 2.04z" fill="currentColor"/>
    </svg>
  );
}

function SalesforceLogo() {
    return (
      <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-[#00A1E0]">
        <path d="M11.23 11.23a4.77 4.77 0 10-4.72-4.72 4.72 4.72 0 004.72 4.72zm.5-7a2.41 2.41 0 01.5 4.77 2.41 2.41 0 01-.5-4.77zM12 0a12 12 0 1012 12A12 12 0 0012 0zm6.53 14.89a3.86 3.86 0 01-3.6 2.44h-1.6a2.66 2.66 0 00-2.66 2.66v.11a.69.69 0 01-.69.69h-1a.69.69 0 01-.69-.69v-1a2.66 2.66 0 00-2.66-2.66h-.11a.69.69 0 01-.69-.69v-1a.69.69 0 01.69-.69h1a2.66 2.66 0 002.66-2.66v-1.6a3.86 3.86 0 012.44-3.6.69.69 0 01.8.19l1.45 1.45a.69.69 0 01-.19.8 3.86 3.86 0 01-3.6 2.44h-1.6a.69.69 0 01-.69.69h-1a.69.69 0 01-.69-.69v-1a.69.69 0 01.69-.69h1a.69.69 0 01.69.69v1.6a2.66 2.66 0 002.66 2.66h1.6a.69.69 0 01.69.69v1a.69.69 0 01-.69.69h-1a.69.69 0 01-.69-.69V14a2.66 2.66 0 00-2.66-2.66h-1.6a.69.69 0 01-.49-.98l1.45-1.45a.69.69 0 01.98.49 3.86 3.86 0 012.44-3.6.69.69 0 01.8.19l1.45 1.45a.69.69 0 01.19.8 3.86 3.86 0 01-3.6 2.44H14a.69.69 0 01-.69.69h-1a.69.69 0 01-.69-.69v-1a.69.69 0 01.69-.69h1a.69.69 0 01.69.69v1.6a3.86 3.86 0 012.44 3.6z" fill="currentColor" />
      </svg>
    );
  }

function MailchimpLogo() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-[#FFE01B]">
       <path d="M21.6 8.4s-.3-3.2-3.6-3.2c-2.4 0-4.7 2.1-4.7 2.1-.3.3-.4.8-.1 1.1l2.4 2.8s.2.2 0 .4c-.2.2-2.1-1.8-2.1-1.8s-.3-.3-.6-.3h-3.3s-.5 0-.5.5v8.7c0 .5.5.5.5.5h3.3c.3 0 .6-.3.6-.3s2-2 2.1-2.1c.2-.2 0-.4 0-.4L13 14.2c-.3-.3.1-.6.1-.6s2.3-2.1 4.7-2.1c3.3 0 3.6 3.2 3.6 3.2V8.4zm-12 5.3H6.4V9.2h3.2v4.5z" fill="#241C15" />
    </svg>
  );
}

function SlackLogo() {
    return (
        <svg role="img" viewBox="0 0 24 24" className="h-8 w-8">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.528 2.528V15.165h2.528z" fill="#36C5F0"></path>
            <path d="M5.042 8.835a2.528 2.528 0 0 1 2.528-2.528h2.528v5.056H5.042V8.835z" fill="#2EB67D"></path>
            <path d="M8.835 18.958a2.528 2.528 0 0 1 2.528 2.528v2.528H8.835V18.96z" fill="#ECB22E"></path>
            <path d="M15.165 18.958a2.528 2.528 0 0 1 2.528-2.528v5.056h-2.528v-2.528z" fill="#E01E5A"></path>
            <path d="M8.835 5.042a2.528 2.528 0 0 1 2.528-2.528v2.528H8.835z" fill="#36C5F0"></path>
            <path d="M15.165 5.042a2.528 2.528 0 0 1 2.528 2.528v2.528H15.165V5.042z" fill="#ECB22E"></path>
            <path d="M18.958 8.835a2.528 2.528 0 0 1-2.528 2.528v2.528h5.056V8.835h-2.528z" fill="#E01E5A"></path>
            <path d="M18.958 15.165a2.528 2.528 0 0 1-2.528 2.528H13.9V15.165h5.056z" fill="#2EB67D"></path>
        </svg>
    );
}

function GoogleAnalyticsLogo() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-[#F9AB00]">
      <path d="M10.2 13.04v-1.78c0-1.79 1.1-2.3 2.1-2.3.9 0 2 .5 2 2v2.12c-1.3 1-2.1 1.5-2.1 2.3s.9 1.3 2.1 2.3v2.1c-2.3-1-3.6-2.2-3.6-4.2s1.4-3.2 3.6-4.2V8.1c-1.8 0-3.3 1.1-3.3 3.14v1.8h-1.2zm3.6 7.66V8.1c1.8 0 3.3 1.1 3.3 3.14v7.62c0 2-1.5 3.14-3.3 3.14s-3.3-1.1-3.3-3.14z" fill="#FBBC04" />
      <path d="M12 24C5.37 24 0 18.63 0 12S5.37 0 12 0s12 5.37 12 12-5.37 12-12 12z" fill="none" />
    </svg>
  );
}

function ZapierLogo() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 text-[#FF4A00]">
      <path d="M24 9.1v5.8h-9.9l-3.2 4.1H0v-4.1h7.8L12 9.1h12zM0 4.9h9.9L13.1 9h-5.3L4.4 4.9H0z" fill="currentColor"/>
    </svg>
  );
}


export function Integrations() {
  const [activeIntegrations, setActiveIntegrations] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string, checked: boolean) => {
    setActiveIntegrations(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-headline">Platform Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite marketing and sales tools to streamline your workflow.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationsList.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {integration.logo}
                  <CardTitle className="font-headline text-xl">{integration.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={integration.id}
                    checked={activeIntegrations[integration.id] || false}
                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                    aria-labelledby={`${integration.id}-label`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p id={`${integration.id}-label`} className="text-sm text-muted-foreground">{integration.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
