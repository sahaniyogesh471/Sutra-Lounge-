import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AvailableReservationSlot {
  start: Date;
  end: Date;
  label: string;
  tableId: string;
}

export interface BusinessHourRecord {
  weekday?: string;
  day?: string;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface BlockedDateRecord {
  blocked_date?: string;
  date?: string;
}

export interface ReservationRecord {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  party_size?: number | null;
  table_id?: string | null;
  reservation_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  special_requests?: string | null;
}

export interface RestaurantTableRecord {
  id: string;
  capacity: number;
  is_active: boolean;
}

export interface RestaurantSettingsRecord {
  slot_interval_minutes?: number | null;
  booking_notice_hours?: number | null;
  default_reservation_duration_minutes?: number | null;
  max_party_size?: number | null;
}

export interface ReservationInsertPayload {
  full_name: string;
  email: string | null;
  phone: string;
  party_size: number;
  table_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'pending';
  special_requests: string | null;
}

interface CalculateAvailableReservationSlotsInput {
  selectedDateStr: string;
  guests: number;
  businessHours: BusinessHourRecord[];
  blockedDates: BlockedDateRecord[];
  reservations: ReservationRecord[];
  tables: RestaurantTableRecord[];
  settings: RestaurantSettingsRecord | null;
  now?: Date;
}

interface ReservationInsertInput {
  fullName: string;
  email: string;
  phone: string;
  partySize: number;
  tableId: string;
  reservationDate: string;
  start: Date;
  end: Date;
  specialRequests: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = createSupabaseClient();

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Public reservations will show no availability.');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export function isRealDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function createReservationInsertPayload(input: ReservationInsertInput): ReservationInsertPayload | null {
  if (!isRealDate(input.start) || !isRealDate(input.end)) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.reservationDate)) {
    return null;
  }

  return {
    full_name: input.fullName.trim(),
    email: input.email.trim() || null,
    phone: input.phone.trim(),
    party_size: Number(input.partySize),
    table_id: input.tableId,
    reservation_date: input.reservationDate,
    start_time: dateToHHMM(input.start),
    end_time: dateToHHMM(input.end),
    status: 'pending',
    special_requests: input.specialRequests.trim() || null
  };
}

export function dateToHHMM(date: Date): string {
  if (!isRealDate(date)) {
    return '';
  }

  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function calculateAvailableReservationSlots({
  selectedDateStr,
  guests,
  businessHours,
  blockedDates,
  reservations,
  tables,
  settings,
  now = new Date()
}: CalculateAvailableReservationSlotsInput): AvailableReservationSlot[] {
  try {
    if (!selectedDateStr) {
      return [];
    }

    const parsedDate = parseSelectedDate(selectedDateStr);
    if (!parsedDate) {
      console.warn(`[calculateAvailableReservationSlots] Invalid selected date: ${selectedDateStr}`);
      return [];
    }

    if (!Array.isArray(blockedDates)) {
      console.warn('[calculateAvailableReservationSlots] blockedDates is not an array');
      return [];
    }

    if (blockedDates.some(blocked => blocked && (blocked.date || blocked.blocked_date) === selectedDateStr)) {
      return [];
    }

    if (!Array.isArray(businessHours) || businessHours.length === 0) {
      console.warn('[calculateAvailableReservationSlots] businessHours is empty');
      return [];
    }

    if (!Array.isArray(tables) || tables.length === 0) {
      console.warn('[calculateAvailableReservationSlots] restaurant_tables is empty');
      return [];
    }

    if (!Array.isArray(reservations)) {
      console.warn('[calculateAvailableReservationSlots] reservations is not an array');
      return [];
    }

    const slotInterval = toPositiveInteger(settings?.slot_interval_minutes);
    const duration = toPositiveInteger(settings?.default_reservation_duration_minutes);
    const bookingNoticeHours = toNonNegativeNumber(settings?.booking_notice_hours);
    const maxPartySize = toPositiveInteger(settings?.max_party_size);

    if (slotInterval === null) {
      console.error('[calculateAvailableReservationSlots] Invalid slot_interval_minutes from restaurant_settings.');
      return [];
    }

    if (duration === null) {
      console.error('[calculateAvailableReservationSlots] Invalid default_reservation_duration_minutes from restaurant_settings.');
      return [];
    }

    if (bookingNoticeHours === null) {
      console.error('[calculateAvailableReservationSlots] Invalid booking_notice_hours from restaurant_settings.');
      return [];
    }

    if (maxPartySize === null) {
      console.error('[calculateAvailableReservationSlots] Invalid max_party_size from restaurant_settings.');
      return [];
    }

    if (!Number.isFinite(guests) || guests < 1) {
      console.warn(`[calculateAvailableReservationSlots] Invalid party size: ${guests}`);
      return [];
    }

    if (guests > maxPartySize) {
      return [];
    }

    const weekdayName = weekdayNames[parsedDate.date.getDay()];
    const dayConfig = businessHours.find(hour => hour && (hour.day?.toLowerCase() || hour.weekday?.toLowerCase()) === weekdayName.toLowerCase());

    if (!dayConfig || dayConfig.is_open !== true) {
      return [];
    }

    const startMinutes = parseTimeToMinutes(dayConfig.start_time);
    const endMinutes = parseTimeToMinutes(dayConfig.end_time);

    if (startMinutes === null || endMinutes === null) {
      console.warn(`[calculateAvailableReservationSlots] Invalid business hours for ${weekdayName}: ${dayConfig.start_time} - ${dayConfig.end_time}`);
      return [];
    }

    if (endMinutes <= startMinutes) {
      console.warn(`[calculateAvailableReservationSlots] End time is not after start time for ${weekdayName}.`);
      return [];
    }

    const activeTables = tables
      .filter(table => table && table.is_active === true && typeof table.capacity === 'number' && table.capacity >= guests)
      .sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id));

    if (activeTables.length === 0) {
      return [];
    }

    const slots: AvailableReservationSlot[] = [];
    const noticeMs = bookingNoticeHours * 60 * 60 * 1000;
    const nowMs = isRealDate(now) ? now.getTime() : Date.now();

    for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += slotInterval) {
      const slotStart = new Date(parsedDate.year, parsedDate.monthIndex, parsedDate.day, Math.floor(minutes / 60), minutes % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

      if (!isRealDate(slotStart) || !isRealDate(slotEnd)) {
        console.warn('[calculateAvailableReservationSlots] Generated invalid slot Date object.');
        return [];
      }

      if (slotStart.getTime() < nowMs + noticeMs) {
        continue;
      }

      const assignedTable = activeTables.find(table => !isTableBookedForSlot({
        table,
        selectedDateStr,
        parsedDate,
        slotStart,
        slotEnd,
        reservations
      }));

      if (assignedTable) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          label: formatSlotLabel(slotStart),
          tableId: assignedTable.id
        });
      }
    }

    return slots;
  } catch (error) {
    console.error('[calculateAvailableReservationSlots] Slot generation failed:', error);
    return [];
  }
}

function isTableBookedForSlot({
  table,
  selectedDateStr,
  parsedDate,
  slotStart,
  slotEnd,
  reservations
}: {
  table: RestaurantTableRecord;
  selectedDateStr: string;
  parsedDate: { year: number; monthIndex: number; day: number };
  slotStart: Date;
  slotEnd: Date;
  reservations: ReservationRecord[];
}): boolean {
  return reservations.some(reservation => {
    if (!reservation || reservation.status === 'cancelled') {
      return false;
    }

    if (reservation.table_id !== table.id) {
      return false;
    }

    if (reservation.reservation_date !== selectedDateStr) {
      return false;
    }

    const reservationStartMinutes = parseTimeToMinutes(reservation.start_time);
    const reservationEndMinutes = parseTimeToMinutes(reservation.end_time);

    if (reservationStartMinutes === null || reservationEndMinutes === null || reservationEndMinutes <= reservationStartMinutes) {
      return false;
    }

    const existingStart = new Date(parsedDate.year, parsedDate.monthIndex, parsedDate.day, Math.floor(reservationStartMinutes / 60), reservationStartMinutes % 60, 0, 0);
    const existingEnd = new Date(parsedDate.year, parsedDate.monthIndex, parsedDate.day, Math.floor(reservationEndMinutes / 60), reservationEndMinutes % 60, 0, 0);

    if (!isRealDate(existingStart) || !isRealDate(existingEnd)) {
      return false;
    }

    return slotStart.getTime() < existingEnd.getTime() && slotEnd.getTime() > existingStart.getTime();
  });
}

function parseSelectedDate(selectedDateStr: string): { year: number; monthIndex: number; day: number; date: Date } | null {
  if (typeof selectedDateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)) {
    return null;
  }

  const [year, month, day] = selectedDateStr.split('-').map(value => Number(value));
  const date = new Date(year, month - 1, day);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, monthIndex: month - 1, day, date };
}

function parseTimeToMinutes(time: unknown): number | null {
  if (typeof time !== 'string') {
    return null;
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function toPositiveInteger(value: unknown): number | null {
  const parsed = toFiniteNumber(value);
  if (parsed === null || parsed <= 0 || !Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

function toNonNegativeNumber(value: unknown): number | null {
  const parsed = toFiniteNumber(value);
  if (parsed === null || parsed < 0) {
    return null;
  }

  return parsed;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatSlotLabel(date: Date): string {
  const hours = date.getHours();
  const displayHours = hours % 12 || 12;
  const displayMinutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return `${displayHours}:${displayMinutes} ${ampm}`;
}

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
