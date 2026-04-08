import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { Plus, Trash2, Pin, Palette } from 'lucide-react';
import format from 'date-fns/format';
import './Notes.css';

const Notes = () => {
  const { notes, categories, addNote, updateNote, deleteNote } = useNotes();
  const [showEditor, setShowEditor] = useState(false);
  
  // Editor State
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#1e293b');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const colors = ['#1e293b', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  const openEditor = (note = null) => {
    setActiveNote(note);
    setTitle(note ? note.title : '');
    setContent(note ? note.content : '');
    setColor(note ? note.color : '#1e293b');
    setIsPinned(note ? note.isPinned : false);
    setSelectedCategory(note && note.category ? note.category._id : '');
    setShowEditor(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { title, content, color, isPinned, category: selectedCategory || null };
    
    if (activeNote) {
      await updateNote(activeNote._id, data);
    } else {
      await addNote(data);
    }
    setShowEditor(false);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className="notes-page animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>My Notes / নোটসমূহ</h2>
        <button className="btn btn-primary" onClick={() => openEditor()}>
          <Plus size={20} /> New Note
        </button>
      </div>

      <div className="notes-masonry">
        {sortedNotes.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No notes found. Create your first note!</div>
        ) : (
          sortedNotes.map(note => (
            <div 
              key={note._id} 
              className="note-card glass-card"
              style={{ backgroundColor: note.color !== '#1e293b' ? `${note.color}80` : '' }}
              onClick={() => openEditor(note)}
            >
              {note.isPinned && <Pin size={16} className="pin-icon" />}
              <h3 className="note-title">{note.title}</h3>
              <p className="note-content">{note.content}</p>
              
              <div className="note-footer">
                <span className="note-date">{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                {note.category && (
                  <span className="note-category" style={{ backgroundColor: note.category.color }}>
                    {note.category.name}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showEditor && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content edit-modal animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                className="editor-title"
                placeholder="Note Title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <button className="icon-btn" onClick={() => setIsPinned(!isPinned)} style={{ color: isPinned ? 'var(--primary)' : 'var(--text-muted)' }}>
                <Pin size={20} />
              </button>
            </div>

            <textarea 
              className="editor-content"
              placeholder="Write something awesome..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
            />

            <div className="editor-toolbar">
              <div className="tool-group">
                <Palette size={18} color="var(--text-muted)" />
                <div className="color-picker">
                  {colors.map(c => (
                    <div 
                      key={c} 
                      className={`color-swatch ${color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="tool-group">
                <select 
                  className="input-field" 
                  style={{ padding: '6px 12px', width: 'auto' }}
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-between" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditor(false)}>Close</button>
                {activeNote && (
                  <button type="button" className="btn btn-danger" onClick={() => { deleteNote(activeNote._id); setShowEditor(false); }}>
                    <Trash2 size={18} /> Delete
                  </button>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleSave}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
