import { supabase } from '../supabase'

export const bibleService = {
  // Get all books
  async getBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('book_number')
    
    if (error) throw error
    return data
  },

  // Get chapters for a book
  async getChapters(bookId) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number')
    
    if (error) throw error
    return data
  },

  // Get verse IDs for a specific range
  async getVerseIds(bookId, chapterNumber, fromVerse, toVerse) {
    const { data, error } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', bookId)
      .eq('chapter_number', chapterNumber)
      .gte('verse_number', fromVerse)
      .lte('verse_number', toVerse)
      .order('verse_number')
    
    if (error) throw error
    return data.map(verse => verse.id)
  },

  // Record verse reading
  async recordReading(userId, verseIds) {
    const readings = verseIds.map(verseId => ({
      user_id: userId,
      verse_id: verseId
    }))

    // Use upsert to avoid duplicates (ON CONFLICT DO NOTHING)
    const { data, error } = await supabase
      .from('verse_readings')
      .upsert(readings, { 
        onConflict: 'user_id,verse_id',
        ignoreDuplicates: true 
      })
    
    if (error) throw error

    // Update daily reading count
    await this.updateDailyReading(userId, verseIds.length)
    
    return data
  },

  // Update daily reading count
  async updateDailyReading(userId, versesReadToday) {
    const today = new Date().toISOString().split('T')[0]
    
    const { error } = await supabase
      .from('daily_readings')
      .upsert({
        user_id: userId,
        reading_date: today,
        verses_read_count: versesReadToday,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,reading_date',
        update: ['verses_read_count', 'updated_at']
      })
    
    if (error) throw error
  },

  // Get user's reading progress
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('verse_readings')
      .select('verse_id')
      .eq('user_id', userId)
    
    if (error) throw error
    return data.length // Total verses read
  },

  // Get today's progress and streak
  async getTodayProgress(userId) {
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's reading count
    const { data: todayData, error: todayError } = await supabase
      .from('daily_readings')
      .select('verses_read_count')
      .eq('user_id', userId)
      .eq('reading_date', today)
      .single()
    
    if (todayError && todayError.code !== 'PGRST116') throw todayError
    
    const todayCount = todayData?.verses_read_count || 0

    // Calculate streak
    const streak = await this.calculateStreak(userId)
    
    return {
      todayCount,
      streak
    }
  },

  // Calculate current reading streak
  async calculateStreak(userId) {
    const { data, error } = await supabase
      .from('daily_readings')
      .select('reading_date, verses_read_count')
      .eq('user_id', userId)
      .gt('verses_read_count', 0)
      .order('reading_date', { ascending: false })
      .limit(365) // Check last year max
    
    if (error) throw error
    if (!data || data.length === 0) return 0

    let streak = 0
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Check if we read today
    const readToday = data[0]?.reading_date === todayStr
    
    for (let i = 0; i < data.length; i++) {
      const readingDate = new Date(data[i].reading_date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - (readToday ? i : i + 1))
      
      if (readingDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  },

  // Get reading plans
  async getReadingPlans() {
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('is_active', true)
      .order('daily_verse_target')
    
    if (error) throw error
    return data
  }
}