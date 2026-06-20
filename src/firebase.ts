import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwvv5yZgLKVQpH-TyI2VRCNOUe25NxjE4",
  authDomain: "concise-anvil-kn56p.firebaseapp.com",
  projectId: "concise-anvil-kn56p",
  storageBucket: "concise-anvil-kn56p.firebasestorage.app",
  messagingSenderId: "650203517892",
  appId: "1:650203517892:web:9e2d73f6ce7279d7c30a91"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-b3bc9767-48fa-42a7-9e4d-471f3ed85725");
const auth = getAuth(app);

// Seed function to prepopulate Firestore if empty
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Restaurant Settings
    const settingsDocRef = doc(db, 'restaurant_settings', 'default');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, {
        restaurant_name: "Sutra Lounge",
        restaurant_email: "info@sutralounge.com.np",
        restaurant_phone: "+977 1500000",
        restaurant_address: "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
        slot_interval_minutes: 30,
        booking_notice_hours: 2,
        default_reservation_duration_minutes: 90,
        max_party_size: 20
      });
      console.log("[Firebase Seed] Seeded restaurant settings");
    }

    // 2. Business Hours
    const businessHoursCol = collection(db, 'business_hours');
    const businessHoursSnap = await getDocs(businessHoursCol);
    if (businessHoursSnap.empty) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (const day of weekdays) {
        await setDoc(doc(db, 'business_hours', day.toLowerCase()), {
          weekday: day,
          is_open: true,
          start_time: "08:00",
          end_time: "21:00"
        });
      }
      console.log("[Firebase Seed] Seeded business hours");
    }

    // 3. Restaurant Tables
    const tablesCol = collection(db, 'restaurant_tables');
    const tablesSnap = await getDocs(tablesCol);
    if (tablesSnap.empty) {
      const defaultTables = [
        { id: "t1", table_name: "Table 1 (Window)", capacity: 2, area: "Main Hall", is_active: true },
        { id: "t2", table_name: "Table 2 (Cozy Corner)", capacity: 2, area: "Main Hall", is_active: true },
        { id: "t3", table_name: "Table 3 (Family)", capacity: 6, area: "Sutra Lounge Room", is_active: true },
        { id: "t4", table_name: "Table 4 (Cabin A)", capacity: 4, area: "Private VIP Cabin", is_active: true },
        { id: "t5", table_name: "Table 5 (Cabin B)", capacity: 4, area: "Private VIP Cabin", is_active: true },
        { id: "t6", table_name: "Table 6 (Executive Banner)", capacity: 8, area: "Private VIP Cabin", is_active: true },
      ];
      for (const t of defaultTables) {
        await setDoc(doc(db, 'restaurant_tables', t.id), {
          table_name: t.table_name,
          capacity: t.capacity,
          area: t.area,
          is_active: t.is_active,
          created_at: new Date().toISOString()
        });
      }
      console.log("[Firebase Seed] Seeded restaurant tables");
    }

    // 4. Menu Items
    const menuCol = collection(db, 'menu_items');
    const menuSnap = await getDocs(menuCol);
    if (menuSnap.empty) {
      const defaultMenuItems = [
        { id: "m1", name: "Sizing Chicken Tandoori", description: "Succulent clay-oven grilled chicken thighs with local Himalayan herbs.", price: 1150, category: "Mains", is_featured: true, is_active: true },
        { id: "m2", name: "Signature Toast Chicken Sandwich", description: "Crispy double-decker with pan-grilled chicken and Swiss cheese.", price: 550, category: "Sandwiches", is_featured: true, is_active: true },
        { id: "m3", name: "Fresh Pancakes Breakfast Combo", description: "Handcrafted golden fluffy pancakes with organic honey and coffee.", price: 490, category: "Breakfast", is_featured: true, is_active: true },
        { id: "m4", name: "Classic Mint Virgin Mojito", description: "Chilled mint-loaded sprigs, cane sugar syrup and fresh limes.", price: 280, category: "Drinks", is_featured: true, is_active: true },
        { id: "m5", name: "Steamed Chicken Momos", description: "Spicy handmade minced chicken dumplings with peanut dipping sauce.", price: 320, category: "Momo Specialties", is_featured: false, is_active: true },
        { id: "m6", name: "Lounge Barista Cappuccino", description: "Double espresso shot with local organic beans and silky hot foam.", price: 240, category: "Drinks", is_featured: false, is_active: true },
      ];
      for (const item of defaultMenuItems) {
        await setDoc(doc(db, 'menu_items', item.id), {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          is_featured: item.is_featured,
          is_active: item.is_active,
          created_at: new Date().toISOString()
        });
      }
      console.log("[Firebase Seed] Seeded menu items");
    }

  } catch (error) {
    console.error("[Firebase Seed Error]", error);
  }
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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { db, auth };
