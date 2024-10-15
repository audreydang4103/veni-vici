import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cat, setCat] = useState(null);
  const [banList, setBanList] = useState({ origins: [], breeds: [] });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedFirstCat, setHasFetchedFirstCat] = useState(false);

  // Fetch a random cat 
  const fetchRandomCat = async (addToHistory = true) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://api.thecatapi.com/v1/images/search?has_breeds=1',
        {
          headers: {
            'x-api-key': import.meta.env.VITE_CAT_API_KEY,
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const breedInfo = data[0].breeds[0];
        const origin = breedInfo ? breedInfo.origin : 'Unknown';
        const breedName = breedInfo ? breedInfo.name : 'Unknown';

        // Check if the cat's origin or breed is in the ban list
        const isBanned =
          banList.origins.includes(origin) || banList.breeds.includes(breedName);

        if (isBanned) {
          fetchRandomCat(false); // Fetch another cat if banned
        } else {
          setCat(data[0]);

          // Add the fetched cat to the history if allowed
          if (addToHistory) {
            setHistory((prevHistory) => [...prevHistory, data[0]]);
          }
        }
      } else {
        console.error('No data received from API.');
      }
    } catch (error) {
      console.error('Error fetching the cat:', error);
    }
    setIsLoading(false);
  };

  // Add the attribute to the ban list
  const handleBan = (type, attribute) => {
    if (attribute && !banList[type].includes(attribute)) {
      setBanList((prevBanList) => ({
        ...prevBanList,
        [type]: [...prevBanList[type], attribute],
      }));
    }
  };

  // Handle the user clicking to fetch a new cat
  const handleUserFetchCat = () => {
    if (!hasFetchedFirstCat) {
      setHasFetchedFirstCat(true);
    }
    fetchRandomCat(true);
  };

  return (
    <div className="container">
      <h1>Veni Vici: Discover Cats!</h1>
      <button onClick={handleUserFetchCat}>Discover New Cat</button>

      {isLoading && <p>Loading...</p>}

      {cat && (
        <div className="cat">
          <img src={cat.url} alt="Random Cat" className="cat-image" />
          <h2>{cat.breeds[0]?.name || 'Unknown Breed'}</h2>
          <p>
            <strong>Origin:</strong> {cat.breeds[0]?.origin || 'Unknown'}
            {cat.breeds[0]?.origin && (
              <button
                className="ban-button"
                onClick={() => handleBan('origins', cat.breeds[0].origin)}
              >
                Ban Origin
              </button>
            )}
          </p>
          <p>
            <strong>Breed:</strong> {cat.breeds[0]?.name || 'Unknown'}
            {cat.breeds[0]?.name && (
              <button
                className="ban-button"
                onClick={() => handleBan('breeds', cat.breeds[0].name)}
              >
                Ban Breed
              </button>
            )}
          </p>
          <p>
            <strong>Temperament:</strong> {cat.breeds[0]?.temperament || 'Unknown'}
          </p>
        </div>
      )}

      <div className="ban-list">
        <h3>Ban List</h3>
        {banList.origins.length > 0 && (
          <>
            <h4>Origins</h4>
            <ul>
              {banList.origins.map((origin, index) => (
                <li key={index}>{origin}</li>
              ))}
            </ul>
          </>
        )}
        {banList.breeds.length > 0 && (
          <>
            <h4>Breeds</h4>
            <ul>
              {banList.breeds.map((breed, index) => (
                <li key={index}>{breed}</li>
              ))}
            </ul>
          </>
        )}
        {banList.origins.length === 0 && banList.breeds.length === 0 && (
          <p>No banned attributes</p>
        )}
      </div>

      <div className="history">
        <h3>History</h3>
        {history.length > 0 ? (
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                {item.breeds[0]?.name || 'Unknown Breed'} from{' '}
                {item.breeds[0]?.origin || 'Unknown'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No history yet</p>
        )}
      </div>
    </div>
  );
}

export default App;
