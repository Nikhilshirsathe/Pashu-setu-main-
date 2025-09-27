import { supabase } from './supabase'

export const createNotification = async (userId, type, title, message, animalId = null) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        animal_id: animalId,
        read: false
      })
    
    if (error) throw error
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export const getNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, animals(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export const getRecentActivities = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*, animals(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

export const createActivity = async (userId, type, description, animalId = null) => {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        type,
        description,
        animal_id: animalId
      })
    
    if (error) throw error
  } catch (error) {
    console.error('Error creating activity:', error)
  }
}