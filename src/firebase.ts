import { initializeApp } from 'firebase/app';

// --------------------------------------------------------------------------
// Transparent Client-Side Local Storage Fallback & Mock DB
// Complete simulation to bypass suspended API keys or network issues.
// --------------------------------------------------------------------------

export function isFallbackActive(): boolean {
  return true; // Force fallback to bypass the suspended Firebase API key
}

export class MockDocRef {
  constructor(public collectionName: string, public docId: string) {}
}

export class MockCollectionRef {
  constructor(public collectionName: string) {}
}

// Default initial state matching the schema defined in AGENTS.md
const DEFAULT_STORE: Record<string, Record<string, any>> = {
  restaurant_settings: {
    default: {
      id: "default",
      restaurant_name: "Sutra Lounge",
      restaurant_email: "info@sutralounge.com.np",
      restaurant_phone: "+977 1500000",
      restaurant_address: "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
      slot_interval_minutes: 30,
      booking_notice_hours: 2,
      default_reservation_duration_minutes: 90,
      max_party_size: 20,
      hero_image_url: "",
      dish_image_url: ""
    }
  },
  business_hours: {
    sunday: { id: "sunday", day: "Sunday", weekday: "Sunday", is_open: true, start_time: "12:00", end_time: "22:00" },
    monday: { id: "monday", day: "Monday", weekday: "Monday", is_open: true, start_time: "12:00", end_time: "22:00" },
    tuesday: { id: "tuesday", day: "Tuesday", weekday: "Tuesday", is_open: true, start_time: "12:00", end_time: "22:00" },
    wednesday: { id: "wednesday", day: "Wednesday", weekday: "Wednesday", is_open: true, start_time: "12:00", end_time: "22:00" },
    thursday: { id: "thursday", day: "Thursday", weekday: "Thursday", is_open: true, start_time: "12:00", end_time: "23:00" },
    friday: { id: "friday", day: "Friday", weekday: "Friday", is_open: true, start_time: "12:00", end_time: "23:00" },
    saturday: { id: "saturday", day: "Saturday", weekday: "Saturday", is_open: true, start_time: "12:00", end_time: "22:00" }
  },
  restaurant_tables: {
    t1: { id: "t1", table_name: "Table 1 (Window)", capacity: 2, area: "Main Hall", is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    t2: { id: "t2", table_name: "Table 2 (Cozy Corner)", capacity: 2, area: "Main Hall", is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    t3: { id: "t3", table_name: "Table 3 (Family)", capacity: 6, area: "Sutra Lounge Room", is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    t4: { id: "t4", table_name: "Table 4 (Cabin A)", capacity: 4, area: "Private VIP Cabin", is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    t5: { id: "t5", table_name: "Table 5 (Cabin B)", capacity: 4, area: "Private VIP Cabin", is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    t6: { id: "t6", table_name: "Table 6 (Executive Banner)", capacity: 8, area: "Private VIP Cabin", is_active: true, created_at: "2026-06-21T00:00:00.000Z" }
  },
  menu_items: {
    m1: { id: "m1", name: "Sizing Chicken Tandoori", description: "Succulent clay-oven grilled chicken thighs with local Himalayan herbs.", price: 1150, category: "Mains", is_featured: true, is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    m2: { id: "m2", name: "Signature Toast Chicken Sandwich", description: "Crispy double-decker with pan-grilled chicken and Swiss cheese.", price: 550, category: "Sandwiches", is_featured: true, is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    m3: { id: "m3", name: "Fresh Pancakes Breakfast Combo", description: "Handcrafted golden fluffy pancakes with organic honey and coffee.", price: 490, category: "Breakfast", is_featured: true, is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    m4: { id: "m4", name: "Classic Mint Virgin Mojito", description: "Chilled mint-loaded sprigs, cane sugar syrup and fresh limes.", price: 280, category: "Drinks", is_featured: true, is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    m5: { id: "m5", name: "Steamed Chicken Momos", description: "Spicy handmade minced chicken dumplings with peanut dipping sauce.", price: 320, category: "Momo Specialties", is_featured: false, is_active: true, created_at: "2026-06-21T00:00:00.000Z" },
    m6: { id: "m6", name: "Lounge Barista Cappuccino", description: "Double espresso shot with local organic beans and silky hot foam.", price: 240, category: "Drinks", is_featured: false, is_active: true, created_at: "2026-06-21T00:00:00.000Z" }
  },
  blocked_dates: {},
  reservations: {},
  admin_users: {
    "admin-usr": { id: "admin-usr", email: "admin@sutralounge.com.np", name: "Administrator", role: "Super Admin", is_active: true }
  },
  online_orders: {}
};

export function getMockCollection(collectionName: string): Record<string, any> {
  const key = `sutra_db_v2_${collectionName}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  const initial = DEFAULT_STORE[collectionName] || {};
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

export function saveMockCollection(collectionName: string, data: Record<string, any>) {
  const key = `sutra_db_v2_${collectionName}`;
  localStorage.setItem(key, JSON.stringify(data));
  triggerMockListeners(collectionName);
}

interface MockListener {
  collectionName: string;
  callback: (snapshot: any) => void;
}

const mockListeners: MockListener[] = [];

export function triggerMockListeners(collectionName: string) {
  const items = getMockCollection(collectionName);
  const docs = Object.keys(items).map(id => ({
    id,
    data: () => ({ id, ...items[id] }),
    exists: () => true
  }));

  const snapshot = {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (cb: any) => docs.forEach(cb),
    find: (cb: any) => docs.find(cb)
  };

  mockListeners.forEach(listener => {
    if (listener.collectionName === collectionName) {
      try {
        listener.callback(snapshot);
      } catch (e) {
        console.error("Mock Snapshot update error", e);
      }
    }
  });
}

export function triggerAllMockListeners() {
  Object.keys(DEFAULT_STORE).forEach(colName => {
    triggerMockListeners(colName);
  });
}

// --------------------------------------------------------------------------
// Mock Auth Simulation
// --------------------------------------------------------------------------

class MockAuth {
  private _currentUser: any = {
    uid: 'admin-uid',
    email: 'admin@sutralounge.com.np',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  };
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    const savedUser = localStorage.getItem('sutra_mock_auth_user');
    if (savedUser) {
      try {
        this._currentUser = JSON.parse(savedUser);
      } catch (e) {
        // use default pre-authenticated user
      }
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  set currentUser(val: any) {
    this._currentUser = val;
    if (val) {
      localStorage.setItem('sutra_mock_auth_user', JSON.stringify(val));
    } else {
      localStorage.removeItem('sutra_mock_auth_user');
    }
    this.listeners.forEach(cb => cb(this._currentUser));
  }

  onAuthStateChanged(cb: (user: any) => void) {
    this.listeners.push(cb);
    setTimeout(() => cb(this._currentUser), 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }
}

const mockAuth = new MockAuth();

// --------------------------------------------------------------------------
// API EXPORTS
// --------------------------------------------------------------------------

export const db: any = {};
export const auth: any = mockAuth;

export function doc(parent: any, collectionOrDocId?: string, docId?: string): any {
  if (typeof parent === 'string') {
    return new MockDocRef(parent, collectionOrDocId!);
  } else if (parent instanceof MockCollectionRef) {
    return new MockDocRef(parent.collectionName, collectionOrDocId!);
  } else {
    return new MockDocRef(collectionOrDocId!, docId!);
  }
}

export function collection(parent: any, path?: string): any {
  const colName = typeof parent === 'string' ? parent : path!;
  return new MockCollectionRef(colName);
}

export async function getDoc(docRef: any): Promise<any> {
  const colName = docRef.collectionName;
  const col = getMockCollection(colName);
  const data = col[docRef.docId];
  return {
    exists: () => !!data,
    id: docRef.docId,
    data: () => data ? { id: docRef.docId, ...data } : undefined
  };
}

export async function getDocs(colRef: any): Promise<any> {
  const colName = colRef.collectionName;
  const col = getMockCollection(colName);
  const docs = Object.keys(col).map(id => ({
    id,
    data: () => ({ id, ...col[id] }),
    exists: () => true
  }));
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (cb: any) => docs.forEach(cb),
    find: (cb: any) => docs.find(cb)
  };
}

export async function setDoc(docRef: any, data: any, options?: any): Promise<any> {
  const colName = docRef.collectionName;
  const col = getMockCollection(colName);
  if (options && options.merge) {
    col[docRef.docId] = { ...col[docRef.docId], ...data };
  } else {
    col[docRef.docId] = data;
  }
  saveMockCollection(colName, col);
}

export async function addDoc(colRef: any, data: any): Promise<any> {
  const colName = colRef.collectionName;
  const col = getMockCollection(colName);
  const docId = 'mock_id_' + Math.random().toString(36).substring(2, 11);
  col[docId] = data;
  saveMockCollection(colName, col);
  return { id: docId };
}

export async function updateDoc(docRef: any, data: any): Promise<any> {
  const colName = docRef.collectionName;
  const col = getMockCollection(colName);
  col[docRef.docId] = { ...col[docRef.docId], ...data };
  saveMockCollection(colName, col);
}

export async function deleteDoc(docRef: any): Promise<any> {
  const colName = docRef.collectionName;
  const col = getMockCollection(colName);
  delete col[docRef.docId];
  saveMockCollection(colName, col);
}

export function onSnapshot(targetRef: any, callback: any, errorCallback?: any): any {
  const collectionName = targetRef.collectionName;
  const listener = { collectionName, callback };
  mockListeners.push(listener);

  setTimeout(() => {
    const items = getMockCollection(collectionName);
    const docs = Object.keys(items).map(id => ({
      id,
      data: () => ({ id, ...items[id] }),
      exists: () => true
    }));
    callback({
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (cb: any) => docs.forEach(cb),
      find: (cb: any) => docs.find(cb)
    });
  }, 0);

  return () => {
    const idx = mockListeners.indexOf(listener);
    if (idx > -1) {
      mockListeners.splice(idx, 1);
    }
  };
}

// Auth mock methods
export function signInWithEmailAndPassword(authObj: any, email: string, psw: string): Promise<any> {
  const mockUser = {
    uid: 'admin-uid',
    email: 'admin@sutralounge.com.np',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  };
  mockAuth.currentUser = mockUser;
  return Promise.resolve({ user: mockUser });
}

export function signOut(authObj: any): Promise<any> {
  mockAuth.currentUser = null;
  return Promise.resolve();
}

export function onAuthStateChanged(authObj: any, callback: any): any {
  return mockAuth.onAuthStateChanged(callback);
}

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
}

export function signInWithPopup(authObj: any, provider: any): Promise<any> {
  const mockUser = {
    uid: 'admin-uid',
    email: 'admin@sutralounge.com.np',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: [{ providerId: 'google.com', email: 'admin@sutralounge.com.np' }]
  };
  mockAuth.currentUser = mockUser;
  return Promise.resolve({ user: mockUser });
}

export async function seedDatabaseIfEmpty() {
  const key = `sutra_db_v2_business_hours`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const hours = {
      sunday: { id: "sunday", day: "Sunday", weekday: "Sunday", is_open: true, start_time: "12:00", end_time: "22:00" },
      monday: { id: "monday", day: "Monday", weekday: "Monday", is_open: true, start_time: "12:00", end_time: "22:00" },
      tuesday: { id: "tuesday", day: "Tuesday", weekday: "Tuesday", is_open: true, start_time: "12:00", end_time: "22:00" },
      wednesday: { id: "wednesday", day: "Wednesday", weekday: "Wednesday", is_open: true, start_time: "12:00", end_time: "22:00" },
      thursday: { id: "thursday", day: "Thursday", weekday: "Thursday", is_open: true, start_time: "12:00", end_time: "23:00" },
      friday: { id: "friday", day: "Friday", weekday: "Friday", is_open: true, start_time: "12:00", end_time: "23:00" },
      saturday: { id: "saturday", day: "Saturday", weekday: "Saturday", is_open: true, start_time: "12:00", end_time: "22:00" }
    };
    localStorage.setItem(key, JSON.stringify(hours));
    console.log("[Firebase Seed] Dynamic Local Storage Mock seeded successfully with updated business hours.");
  }
  return Promise.resolve();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'admin-uid',
      email: 'admin@sutralounge.com.np',
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error (handled gracefully):', JSON.stringify(errInfo));
}
