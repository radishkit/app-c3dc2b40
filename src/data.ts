// Shared types + seeded data for the Valet Parking Permit Portal.

export type PermitStatus = 'Submitted' | 'Under Review' | 'Approved';

export interface Application {
  businessName: string;
  businessType: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  zoneId: string;
  curbLength: string;
  stands: string;
  days: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  operator: string;
}

export interface Permit {
  id: string; // e.g. VP26-00121
  app: Application;
  status: PermitStatus;
  submittedAt: string; // ISO
  reviewStartedAt?: string;
  approvedAt?: string;
  fee: number;
}

export const EMPTY_APP: Application = {
  businessName: '',
  businessType: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  zoneId: '',
  curbLength: '',
  stands: '1',
  days: [],
  startTime: '17:00',
  endTime: '23:00',
  startDate: '',
  operator: '',
};

export const BUSINESS_TYPES = [
  'Restaurant / Bar',
  'Hotel',
  'Event Venue',
  'Retail',
  'Office / Commercial',
  'Other',
];

export interface Zone {
  id: string;
  name: string;
  blurb: string;
  multiplier: number;
}

export const ZONES: Zone[] = [
  { id: 'A1', name: 'Downtown Core', blurb: 'Highest demand · metered curbs', multiplier: 1.5 },
  { id: 'B2', name: 'Waterfront District', blurb: 'Harbor restaurants & hotels', multiplier: 1.3 },
  { id: 'C3', name: 'Meridian District', blurb: 'Arts & nightlife corridor', multiplier: 1.2 },
  { id: 'D4', name: 'Equator Row', blurb: 'Neighborhood main street', multiplier: 1.0 },
  { id: 'E5', name: 'Prime Point', blurb: 'Civic center & museums', multiplier: 1.1 },
  { id: 'F6', name: 'Latitude Heights', blurb: 'Residential / limited hours', multiplier: 0.9 },
];

export const BASE_FEE = 150;
export const PER_STAND_FEE = 75;

export function calcFee(zoneId: string, stands: string): number {
  const zone = ZONES.find((z) => z.id === zoneId);
  const nStands = Math.max(1, parseInt(stands || '1', 10) || 1);
  const mult = zone ? zone.multiplier : 1;
  return Math.round((BASE_FEE + nStands * PER_STAND_FEE) * mult);
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------------------------------------------------------------------
// Seeded permits so "My Permits" feels lived-in on first open
// ---------------------------------------------------------------------------

const daysAgo = (n: number, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 24, 0, 0);
  return d.toISOString();
};

export const SEED_PERMITS: Permit[] = [
  {
    id: 'VP26-00108',
    status: 'Approved',
    submittedAt: daysAgo(21),
    reviewStartedAt: daysAgo(19, 9),
    approvedAt: daysAgo(14, 15),
    fee: 338,
    app: {
      ...EMPTY_APP,
      businessName: 'Null Point Brewing Co.',
      businessType: 'Restaurant / Bar',
      contactName: 'Dana Okafor',
      email: 'dana@nullpointbrewing.com',
      phone: '(555) 010-2214',
      address: '42 Harborline Ave',
      zoneId: 'B2',
      curbLength: '60',
      stands: '2',
      days: ['Thu', 'Fri', 'Sat'],
      startTime: '17:00',
      endTime: '23:30',
      startDate: daysAgo(10).slice(0, 10),
      operator: 'Meridian Valet Services LLC',
    },
  },
  {
    id: 'VP26-00114',
    status: 'Under Review',
    submittedAt: daysAgo(4),
    reviewStartedAt: daysAgo(2, 9),
    fee: 450,
    app: {
      ...EMPTY_APP,
      businessName: 'Hotel Meridian',
      businessType: 'Hotel',
      contactName: 'Luis Ferreira',
      email: 'events@hotelmeridian.com',
      phone: '(555) 010-8830',
      address: '1 Meridian Plaza',
      zoneId: 'A1',
      curbLength: '80',
      stands: '2',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startTime: '06:00',
      endTime: '23:00',
      startDate: daysAgo(-7).slice(0, 10),
      operator: 'Prime Park Valet Inc.',
    },
  },
];

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const PERMITS_KEY = 'nullisland-valet-permits';
export const DRAFT_KEY = 'nullisland-valet-draft';

export function loadPermits(): Permit[] {
  try {
    const raw = localStorage.getItem(PERMITS_KEY);
    const mine: Permit[] = raw ? JSON.parse(raw) : [];
    return [...mine, ...SEED_PERMITS];
  } catch {
    return [...SEED_PERMITS];
  }
}

export function savePermit(p: Permit) {
  try {
    const raw = localStorage.getItem(PERMITS_KEY);
    const mine: Permit[] = raw ? JSON.parse(raw) : [];
    mine.unshift(p);
    localStorage.setItem(PERMITS_KEY, JSON.stringify(mine));
  } catch {
    /* storage unavailable — permit still shows this session via state */
  }
}

export function nextPermitNumber(): string {
  const all = loadPermits();
  const max = all.reduce((m, p) => {
    const n = parseInt(p.id.split('-')[1], 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 114);
  return `VP26-${String(max + 1).padStart(5, '0')}`;
}

export function loadDraft(): { app: Application; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(app: Application, step: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ app, step }));
  } catch {
    /* noop */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function fmtDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString(undefined, {
    weekday: undefined,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function zoneLabel(zoneId: string): string {
  const z = ZONES.find((x) => x.id === zoneId);
  return z ? `${z.name} (${z.id})` : zoneId;
}
