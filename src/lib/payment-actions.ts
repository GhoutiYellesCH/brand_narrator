
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getFirebase } from '@/firebase/server';

const { auth: adminAuth } = getFirebase();
