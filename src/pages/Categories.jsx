import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { Plus, Trash2, Edit2, Folder, Book, Briefcase, Camera, Code, Star, Heart, FileText, Music, Image as ImageIcon, Video, Box, Package, Activity, Target } from 'lucide-react';
import './Categories.css';

const iconMap = {
  folder: Folder,
  book: Book,
  briefcase: Briefcase,
  camera: Camera,
  code: Code,
  star: Star,
  heart: Heart,
  fileText: FileText,
  music: Music,
  image: ImageIcon,
  video: Video,
  box: Box,
  package: Package,
  activity: Activity,
  target: Target,
};

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useNotes();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [iconName, setIconName] = useState('folder');

  const catColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  const openAdd = () => {
    setEditId(null);
    setName('');
    setColor('#3b82f6');
    setIconName('folder');
    setShowAdd(true);
  };

  const openEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setColor(cat.color);
    setIconName(cat.icon || 'folder');
    setShowAdd(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateCategory(editId, name, color, iconName);
    } else {
      await addCategory(name, color, iconName);
    }
    setShowAdd(false);
  };

  const renderIcon = (name, size=20, iconColor="currentColor") => {
    const IconCmp = iconMap[name] || Folder;
    return <IconCmp size={size} color={iconColor} />;
  };

  return (
    <div className="categories-page animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>Categories / ক্যাটেগরি</h2>
      </div>

      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="empty-state">No categories found. Start organizing!</div>
        ) : (
          categories.map(cat => (
            <div key={cat._id} className="category-card glass-card">
              <div className="cat-header">
                <div className="cat-color" style={{ backgroundColor: cat.color }}>
                  {renderIcon(cat.icon || 'folder', 18, '#ffffff')}
                </div>
                <h3>{cat.name}</h3>
              </div>
              
              <div className="cat-actions">
                <button className="icon-btn edit-btn" onClick={() => openEdit(cat)}>
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn delete-btn" onClick={() => deleteCategory(cat._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab-btn" onClick={openAdd}>
        <Plus size={24} />
      </button>

      {/* Editor Modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <h3>{editId ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Category Name</label>
                <input 
                  required 
                  className="input-field" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Work, Personal"
                />
              </div>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Select Color</label>
                <div className="cat-color-picker">
                  {catColors.map(c => (
                    <div 
                      key={c} 
                      className={`cat-color-swatch ${color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Select Icon</label>
                <div className="cat-icon-picker">
                  {Object.keys(iconMap).map(k => (
                    <div 
                      key={k} 
                      className={`cat-icon-swatch ${iconName === k ? 'selected' : ''}`}
                      onClick={() => setIconName(k)}
                      title={k}
                    >
                      {renderIcon(k, 20)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-between">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
