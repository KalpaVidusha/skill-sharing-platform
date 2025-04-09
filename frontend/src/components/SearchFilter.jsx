// src/components/SearchFilter.jsx
import React from 'react';

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) => {
  const styles = {
    container: `
      margin-bottom: 30px;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    `,
    searchContainer: `
      position: relative;
      flex: 1;
      min-width: 300px;
    `,
    searchIcon: `
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #aaa;
    `,
    searchInput: `
      width: 75%;
      padding: 14px 15px 14px 45px;
      border-radius: 30px;
      border: 1px solid #e0e0e0;
      background-color: white;
      font-size: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      outline: none;
    `,
    searchInputFocus: `
      border-color: #2196f3;
      box-shadow: 0 2px 10px rgba(33, 150, 243, 0.2);
    `,
    dropdown: `
      padding: 14px 20px;
      border-radius: 30px;
      border: 1px solid #e0e0e0;
      background-color: white;
      min-width: 200px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      cursor: pointer;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 15px center;
      padding-right: 40px;
      transition: all 0.3s ease;
    `,
    dropdownFocus: `
      border-color: #2196f3;
      box-shadow: 0 2px 10px rgba(33, 150, 243, 0.2);
    `,
    clearButton: `
      padding: 14px 25px;
      border-radius: 30px;
      border: none;
      background-color: #f5f5f5;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    `,
    clearButtonHover: `
      background-color: #e0e0e0;
    `
  };

  const [inputFocused, setInputFocused] = React.useState(false);
  const [selectFocused, setSelectFocused] = React.useState(false);
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);

  return (
    <div style={{ cssText: styles.container }}>
      <div style={{ cssText: styles.searchContainer }}>
        <span style={{ cssText: styles.searchIcon }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search Courses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ cssText: `${styles.searchInput} ${inputFocused ? styles.searchInputFocus : ''}` }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
      </div>
      
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ cssText: `${styles.dropdown} ${selectFocused ? styles.dropdownFocus : ''}` }}
        onFocus={() => setSelectFocused(true)}
        onBlur={() => setSelectFocused(false)}
      >
        <option value="">Category</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <button
        onClick={() => {
          setSearchTerm('');
          setSelectedCategory('');
        }}
        style={{ cssText: `${styles.clearButton} ${isButtonHovered ? styles.clearButtonHover : ''}` }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default SearchFilter;