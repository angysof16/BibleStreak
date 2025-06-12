import { useState, useEffect } from 'react'
import { bibleService } from '../services/bibleService'

export function useReadings(userId) {
  const [totalRead, setTotalRead] = useState(0)
  const [todayRead, setTodayRead] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadReadingData()
    }
  }, [userId])

  const loadReadingData = async () => {
    try {
      setLoading(true)
      
      // Load total progress
      const progress = await bibleService.getUserProgress(userId)
      setTotalRead(progress)
      
      // Load today's data and streak
      const todayData = await bibleService.getTodayProgress(userId)
      setTodayRead(todayData.todayCount)
      setStreak(todayData.streak)
      
    } catch (error) {
      console.error('Error loading reading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const recordReading = async (verseIds) => {
    try {
      await bibleService.recordReading(userId, verseIds)
      // Reload data after recording
      await loadReadingData()
    } catch (error) {
      console.error('Error recording reading:', error)
      throw error
    }
  }

  return {
    totalRead,
    todayRead,
    streak,
    loading,
    recordReading,
    refreshData: loadReadingData
  }
}