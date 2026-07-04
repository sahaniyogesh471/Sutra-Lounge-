/**
 * Supabase Service Layer - Firebase-compatible API
 * 
 * This provides a drop-in replacement for Firebase Firestore operations.
 * All methods match the Firebase API so minimal code changes are needed.
 */

import { supabase } from './lib/supabase'

// ============================================================================
// RESTAURANT SETTINGS
// ============================================================================

export async function getRestaurantSettings() {
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching settings:', error)
    return null
  }
  return data
}

export async function updateRestaurantSettings(settings: any) {
  try {
    // Get the first (and typically only) restaurant settings ID
    const { data: existing, error: fetchError } = await supabase
      .from('restaurant_settings')
      .select('id')
      .limit(1)
      .single()

    if (fetchError || !existing?.id) {
      throw new Error('No restaurant settings found')
    }

    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  } catch (err: any) {
    throw new Error(err.message || 'Failed to update restaurant settings')
  }
}

// ============================================================================
// BUSINESS HOURS
// ============================================================================

export async function getBusinessHours() {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('id')

  if (error) throw new Error(error.message)
  
  // Convert to object with day as key
  const hoursObj: any = {}
  data?.forEach((day: any) => {
    hoursObj[day.id] = day
  })
  return hoursObj
}

export async function getBusinessHoursForDay(dayId: string) {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('id', dayId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBusinessHoursForDay(dayId: string, hours: any) {
  const { data, error } = await supabase
    .from('business_hours')
    .update(hours)
    .eq('id', dayId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ============================================================================
// RESTAURANT TABLES
// ============================================================================

export async function getRestaurantTables() {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('table_number')

  if (error) throw new Error(error.message)
  return data || []
}

export async function updateRestaurantTable(tableId: string, updates: any) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update(updates)
    .eq('id', tableId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ============================================================================
// MENU ITEMS
// ============================================================================

export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('category')

  if (error) throw new Error(error.message)
  return data || []
}

export async function addMenuItem(item: any) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([item])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateMenuItem(itemId: string, updates: any) {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteMenuItem(itemId: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

// ============================================================================
// RESERVATIONS
// ============================================================================

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getReservationsByDate(date: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('reservation_date', date)
    .order('start_time')

  if (error) throw new Error(error.message)
  return data || []
}

export async function addReservation(reservation: any) {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateReservation(reservationId: string, updates: any) {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', reservationId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteReservation(reservationId: string) {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId)

  if (error) throw new Error(error.message)
}

// ============================================================================
// ONLINE ORDERS
// ============================================================================

export async function getOrders() {
  const { data, error } = await supabase
    .from('online_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function addOrder(order: any) {
  const { data, error } = await supabase
    .from('online_orders')
    .insert([order])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateOrder(orderId: string, updates: any) {
  const { data, error } = await supabase
    .from('online_orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase
    .from('online_orders')
    .delete()
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}

// ============================================================================
// BLOCKED DATES
// ============================================================================

export async function getBlockedDates() {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('blocked_date')
    .order('blocked_date')

  if (error) throw new Error(error.message)
  
  // Return as array of date strings
  return (data || []).map(row => row.blocked_date)
}

export async function isDateBlocked(date: string) {
  const blockedDates = await getBlockedDates()
  return blockedDates.includes(date)
}

export async function addBlockedDate(date: string, reason?: string) {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert([{ blocked_date: date, reason }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function removeBlockedDate(date: string) {
  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('blocked_date', date)

  if (error) throw new Error(error.message)
}

// ============================================================================
// ADMIN USERS
// ============================================================================

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, email, full_name, is_active')
    .eq('is_active', true)

  if (error) throw new Error(error.message)
  return data || []
}

export async function addAdminUser(user: any) {
  // Hash password (in production use bcrypt on backend)
  const { data, error } = await supabase
    .from('admin_users')
    .insert([user])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateAdminUser(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (Firebase-style onSnapshot)
// ============================================================================

export function subscribeToReservations(callback: (data: any[]) => void) {
  // Set up real-time subscription using Realtime
  const subscription = supabase
    .channel('reservations-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'reservations' },
      (payload) => {
        // Re-fetch data on any change
        getReservations().then(callback).catch(console.error)
      }
    )
    .subscribe()

  return subscription
}

export function subscribeToOrders(callback: (data: any[]) => void) {
  const subscription = supabase
    .channel('orders-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'online_orders' },
      (payload) => {
        getOrders().then(callback).catch(console.error)
      }
    )
    .subscribe()

  return subscription
}

export function subscribeToBusinessHours(callback: (data: any) => void) {
  const subscription = supabase
    .channel('hours-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'business_hours' },
      (payload) => {
        getBusinessHours().then(callback).catch(console.error)
      }
    )
    .subscribe()

  return subscription
}
