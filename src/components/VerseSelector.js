import React, { useState, useEffect } from 'react'
import { bibleService } from '../services/bibleService'

function VerseSelector({ onVersesRead }) {
  const [books, setBooks] = useState([])
  const [chapters, setChapters] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [verseRange, setVerseRange] = useState({ from: 1, to: 1 })
  const [maxVerses, setMaxVerses] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook)
    }
  }, [selectedBook])

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerseCount(selectedBook, selectedChapter)
    }
  }, [selectedBook, selectedChapter])

  const loadBooks = async () => {
    try {
      const booksData = await bibleService.getBooks()
      setBooks(booksData)
    } catch (error) {
      console.error('Error loading books:', error)
    }
  }

  const loadChapters = async (bookId) => {
    try {
      const chaptersData = await bibleService.getChapters(bookId)
      setChapters(chaptersData)
      setSelectedChapter('')
      setVerseRange({ from: 1, to: 1 })
    } catch (error) {
      console.error('Error loading chapters:', error)
    }
  }

  const loadVerseCount = async (bookId, chapterNumber) => {
    try {
      const chapter = chapters.find(c => c.chapter_number == chapterNumber)
      if (chapter) {
        setMaxVerses(chapter.verse_count)
        setVerseRange({ from: 1, to: Math.min(5, chapter.verse_count) })
      }
    } catch (error) {
      console.error('Error loading verse count:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBook || !selectedChapter) return

    setIsLoading(true)
    try {
      // Get verse IDs for the selected range
      const verseIds = await bibleService.getVerseIds(
        selectedBook, 
        selectedChapter, 
        verseRange.from, 
        verseRange.to
      )
      
      await onVersesRead(verseIds)
      
      // Reset form
      setSelectedBook('')
      setSelectedChapter('')
      setVerseRange({ from: 1, to: 1 })
      
    } catch (error) {
      console.error('Error recording reading:', error)
      alert('Error al registrar la lectura. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerseRangeChange = (field, value) => {
    const numValue = parseInt(value)
    if (field === 'from') {
      setVerseRange(prev => ({
        from: numValue,
        to: Math.max(numValue, prev.to)
      }))
    } else {
      setVerseRange(prev => ({
        ...prev,
        to: numValue
      }))
    }
  }

  const selectedBookName = books.find(b => b.id == selectedBook)?.name_spanish || ''
  const verseCount = verseRange.to - verseRange.from + 1

  return (
    <div className="card">
      <h2>📝 Registrar Lectura</h2>
      
      <form onSubmit={handleSubmit}>
        <select
          className="select"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          required
        >
          <option value="">Selecciona un libro</option>
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.name_spanish}
            </option>
          ))}
        </select>

        {selectedBook && (
          <select
            className="select"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            required
          >
            <option value="">Selecciona un capítulo</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.chapter_number}>
                Capítulo {chapter.chapter_number}
              </option>
            ))}
          </select>
        )}

        {selectedBook && selectedChapter && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Rango de versículos:
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                className="input"
                style={{ width: '80px' }}
                min="1"
                max={maxVerses}
                value={verseRange.from}
                onChange={(e) => handleVerseRangeChange('from', e.target.value)}
              />
              <span>a</span>
              <input
                type="number"
                className="input"
                style={{ width: '80px' }}
                min={verseRange.from}
                max={maxVerses}
                value={verseRange.to}
                onChange={(e) => handleVerseRangeChange('to', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedBook && selectedChapter && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            📖 {selectedBookName} {selectedChapter}:{verseRange.from}
            {verseRange.from !== verseRange.to && `-${verseRange.to}`}
            <br />
            <span style={{ color: '#666' }}>
              ({verseCount} versículo{verseCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        <button 
          type="submit" 
          className="button"
          disabled={!selectedBook || !selectedChapter || isLoading}
          style={{ marginTop: '15px' }}
        >
          {isLoading ? 'Registrando...' : '✅ Marcar como Leído'}
        </button>
      </form>
    </div>
  )
}

export default VerseSelector