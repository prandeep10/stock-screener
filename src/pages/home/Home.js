import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './Home.css'; // Import the CSS file for styling

const Home = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    'CMP (Rs.)': '',
    'P/E': '',
    'Mar Cap (Rs. Cr.)': '',
    'Div Yld (%)': '',
    'NP Qtr (Rs. Cr.)': '',
    'Qtr Profit Var (%)': '',
    'Sales Qtr (Rs. Cr.)': '',
    'Qtr Sales Var (%)': '',
    'ROCE (%)': ''
  });

  // Function to read and parse the CSV file
  const fetchData = async () => {
    const response = await fetch('/companies_data.csv');
    const csvText = await response.text();

    // Parse CSV data into JSON
    Papa.parse(csvText, {
      complete: (result) => {
        setData(result.data);
        setFilteredData(result.data); // Initially show all data
      },
      header: true, // Use the first row as headers
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter the data based on filter values
  const applyFilters = (filters) => {
    const filtered = data.filter((row) => {
      return Object.keys(filters).every((key) => {
        const cellValue = row[key] ? row[key].toString().toLowerCase() : ''; // Handle undefined or null values
        return cellValue.includes(filters[key].toLowerCase());
      });
    });
    setFilteredData(filtered);
  };

  // Handle filter change
  const handleFilterChange = (event, column) => {
    const value = event.target.value;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [column]: value };
      applyFilters(newFilters); // Apply filter immediately after change
      return newFilters;
    });
  };

  // Handle sorting
  const handleSort = (column) => {
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = isNaN(a[column]) ? a[column] : parseFloat(a[column]);
      const bValue = isNaN(b[column]) ? b[column] : parseFloat(b[column]);
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });
    setFilteredData(sortedData);
  };

  return (
    <div className="container">
      <h1 className="title">OG Screener</h1>

      <div className="filters">
        {Object.keys(filters).map((column) => (
          <div key={column} className="filter-input">
            <label>{column}:</label>
            <input
              type="text"
              value={filters[column]}
              onChange={(e) => handleFilterChange(e, column)}
              placeholder={`Filter by ${column}`}
            />
          </div>
        ))}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>S.No</th> {/* Add S.No column header */}
            <th>Name</th> {/* Add Company Name column */}
            {Object.keys(filters).map((column) => (
              <th key={column} onClick={() => handleSort(column)}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Dynamically generate S.No using index */}
                <td>{row['Name']}</td> {/* Display Company Name */}
                {Object.keys(filters).map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11">Loading...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
