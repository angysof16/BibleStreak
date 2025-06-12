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

  // Record verse reading
  async recordReading(userId, verseIds) {
    const readings = verseIds.map(verseId => ({
      user_id: userId,
      verse_id: verseId
    }))

    const { data, error } = await supabase
      .from('verse_readings')
      .insert(readings)
    
    if (error) throw error
    return data
  },

  // Get user's reading progress
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('verse_readings')
      .select('verse_id')
      .eq('user_id', userId)
    
    if (error) throw error
    return data.length // Total verses read
  }
}