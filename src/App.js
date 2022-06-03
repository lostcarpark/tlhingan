import React, { useState, useEffect } from "react";
import "./App.css";
import mapping from "./mapping.json";

function App() {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const found = mapping.find((letter) =>  letter.char === c);
      if (found) return found.latin;
      return c;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const letters = mapping.map((letter) => {
    return (
      <div key={letter.latin}>
        <span className="pIqaD">{letter.char}</span> <span>{letter.latin}</span>
      </div>
    );
  });
  const wordList = words
    .filter((word) => word.length === 5)
    .map((word) => {
      return (
        <div key={word}>
          <span className="pIqaD">{word}</span>{" "}
          <span>{transliterate(word)}</span>
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
      <div>{letters}</div>
      <div>{wordList}</div>
    </div>
  );
}

export default App;
