import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

// Helpers to convert between React's '#rrggbb' and backend/Flutter's 0xffrrggbb Number
const hexToNum = (hex) => parseInt('ff' + (hex || '#1e293b').replace('#', ''), 16);
const numToHex = (num) => {
  if (!num) return '#1e293b';
  return '#' + num.toString(16).padStart(8, '0').slice(2);
};

export const NotesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.data.map(n => ({ ...n, color: numToHex(n.colorValue) })));
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.map(c => ({ ...c, color: numToHex(c.colorValue) })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([fetchNotes(), fetchCategories()]).finally(() => setLoading(false));
    } else {
      setNotes([]);
      setCategories([]);
    }
  }, [isAuthenticated]);

  const addNote = async (data) => {
    const payload = { ...data, colorValue: hexToNum(data.color) };
    const res = await api.post('/notes', payload);
    const newNote = { ...res.data.data, color: data.color };
    setNotes([newNote, ...notes]);
    return newNote;
  };

  const updateNote = async (id, data) => {
    const payload = { ...data, colorValue: hexToNum(data.color) };
    const res = await api.put(`/notes/${id}`, payload);
    const updatedNote = { ...res.data.data, color: data.color };
    setNotes(notes.map(n => n._id === id ? updatedNote : n));
    return updatedNote;
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes(notes.filter(n => n._id !== id));
  };

  const addCategory = async (name, color, icon) => {
    const res = await api.post('/categories', { name, colorValue: hexToNum(color), icon });
    const newCat = { ...res.data.data, color };
    setCategories([...categories, newCat]);
    return newCat;
  };

  const updateCategory = async (id, name, color, icon) => {
    const res = await api.put(`/categories/${id}`, { name, colorValue: hexToNum(color), icon });
    setCategories(categories.map(c => c._id === id ? { ...res.data.data, color } : c));
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    setCategories(categories.filter(c => c._id !== id));
  };

  return (
    <NotesContext.Provider value={{
      notes, categories, loading, 
      fetchNotes, addNote, updateNote, deleteNote,
      addCategory, updateCategory, deleteCategory
    }}>
      {children}
    </NotesContext.Provider>
  );
};
