import React, { useState, useEffect } from "react";
import "./App.css";
import mapping from "./mapping.json";

function App() {
  const [maxWords, setMaxWords] = useState(100);
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordLength, setWordLength] = useState(5);

  const fetchData = () => {
    fetch("/klingon.txt")
      .then((r) => r.text())
      .then((text) => {
        const allWords = [];
        text.split("\n").forEach((word) => {
          allWords.push(word);
        });
        setWords(allWords);
        setIsLoading(false);
      });
    // Convert hex values to characters in mapping array..
    mapping.forEach((letter) => {
      letter.char = String.fromCharCode(parseInt(letter.tlhingan, 16));
    });
    console.log(mapping);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const transliterate = (word) => {
    return [...word].map((c) => {
      const found = mapping.find((letter) => letter.char === c);
      if (found) return found.latin;
      return c;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const letters = mapping.map((letter) => {
    return (
      <span key={letter.latin} className="letter">
        <span className="pIqaD">{letter.char}</span> <span>{letter.latin}</span>
      </span>
    );
  });
  const totalWords = words.filter((word) => word.length === wordLength);
  const wordList = totalWords.slice(0, maxWords).map((word) => {
    return (
      <div key={word}>
        <span className="pIqaD">{word}</span> <span>{transliterate(word)}</span>
      </div>
    );
  });
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="pIqaD">
          &#xf8e4;&#xf8d7;&#xf8dc;&#xf8d0;&#xf8db; &#xf8da;&#xf8e5;&#xf8e9;
          &#xf8e3;&#xf8e5;&#xf8e9;{" "}
        </h1>
        <h2>Klingon Word Finder</h2>
      </header>
      <div>
        <label htmlFor="maxWords">Maximum number of results:</label>
        <input
          id="maxWords"
          type="number"
          value={maxWords}
          onChange={(e) => setMaxWords(parseInt(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="wordLength">Word length:</label>
        <input
          id="wordLength"
          type="number"
          value={wordLength}
          onChange={(e) => setWordLength(parseInt(e.target.value))}
        />
      </div>
      <div>{letters}</div>
      <div>Total words found: {totalWords.length}.</div>
      <div>{wordList}</div>
    </div>
  );
}

export default App;
