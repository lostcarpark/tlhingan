import React, { useState, useEffect } from "react";
import mapping from "./mapping.json";

function App() {
  const [words, setWords] = useState([]);
  const [keyboard, setKeyboard] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [maxWords, setMaxWords] = useState(100);
  const [wordLength, setWordLength] = useState(5);
  const [focus, setFocus] = useState("");
  const [knownLetters, setKnownLetters] = useState([]);
  const [includeLetters, setIncludeLetters] = useState("");
  const [excludeLetters, setExcludeLetters] = useState("");
  const [noRepeatLetters, setNoRepeatLetters] = useState(false);

  /**
   * Load file of Klingon words and split into an array.
   * Stores result in session variable.
   */
  const fetchData = () => {
    fetch("/klingon.txt")
      .then((r) => r.text())
      .then((text) => {
        const allWords = [];
        text.split("\n").forEach((word) => {
          allWords.push(word);
        });
        setWords(allWords);
      });
  };
  /**
   * Loop through mapping array and convert string containing hex
   * Unicode value and convert into string character.
   */
  const addChars = () => {
    // Convert hex values to characters in mapping array..
    mapping.forEach((letter) => {
      letter.char = String.fromCharCode(parseInt(letter.tlhingan, 16));
    });
  };
  /**
   * Build keyboard grid from character mapping, using row and col properties.
   */
  const mapKeyboard = () => {
    const rows = [[], [], []];
    mapping.forEach((letter) => {
      rows[letter.row].push(letter);
    });
    setKeyboard(rows);
  };
  /**
   * Called when page loads. Call initial setup tasks.
   * Set isLoading false when done.
   */
  useEffect(() => {
    fetchData();
    addChars();
    mapKeyboard();
    setIsLoading(false);
  }, []);

  /**
   * Function that takes a string in pIqaD and transliterates to Latin.
   *
   * @param {String} word
   * @returns {String}
   */
  const transliterate = (word) => {
    return [...word].map((c) => {
      const found = mapping.find((letter) => letter.char === c);
      if (found) return found.latin;
      return c;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Placeholder while data fetched.
  }
  // Prepare kayboard for display.
  const rows = keyboard.map((row) => {
    const cols = row
      .sort((a, b) => a.col - b.col)
      .map((letter) => {
        return (
          <div
            key={letter.latin}
            id={letter.char}
            className="letter"
            onClick={(e) => {
              // Keyboard clicked - add letter to textbox with last focus.
              if (focus.includes("knownLetter_")) {
                // Known letter had focus. Find which one and replace with key clicked.
                const split = focus.split("_");
                const index = parseInt(split[1]);
                const letters = [...knownLetters];
                letters[index] = e.currentTarget.id;
                setKnownLetters(letters);
              }
              if (focus === "includeLetters") {
                // Included letters had focus. Append new letter.
                setIncludeLetters(includeLetters + e.currentTarget.id);
                return;
              }
              if (focus === "excludeLetters") {
                // Excluded letters had focus. Append new letter.
                setExcludeLetters(excludeLetters + e.currentTarget.id);
                return;
              }
            }}
          >
            <span className="pIqaD">{letter.char}</span>{" "}
            <span>{letter.latin}</span>
          </div>
        );
      });
    return (
      <div key={row} className="row">
        {cols}
      </div>
    );
  });
  /**
   * Apply filters to dictionary list. We want all qualifying words so we can show count.
   */
  const totalWords = words
    .filter((word) => word.length === wordLength) // Filter words of specified length.
    .filter((word) => {
      // Filter words with known letters in exact positions.
      return knownLetters.every((letter, position) => {
        if (typeof letter !== "string" || letter.length === 0) return true; // Only test if known letter specified.
        return letter === word.charAt(position);
      });
    })
    .filter((word) => {
      // Filter words that include required letters anywhere.
      return includeLetters.split("").every((letter) => word.includes(letter));
    })
    .filter((word) => {
      // Filter words that don't contain excluded letters.
      return excludeLetters.split("").every((letter) => !word.includes(letter));
    })
    .filter((word) => {
      // If "no repeat" selected, filter out any words where the same letter appears more than once.
      if (!noRepeatLetters) return true;
      for (const c of word)
        if (word.match(new RegExp(c, "gi") || []).length > 1) {
          return false;
        }
      return true;
    });
  /**
   * Get required number of words.
   */
  const wordList = totalWords.slice(0, maxWords).map((word) => {
    return (
      <div key={word}>
        <span className="pIqaD">{word}</span> <span>{transliterate(word)}</span>
      </div>
    );
  });

  /**
   * Make a list of textboxes for known letters.
   */
  const knownLetterInputs = [];
  for (let i = 0; i < wordLength; i++) {
    knownLetterInputs.push(
      <input
        key={i}
        id={"knownLetter_" + i}
        type="text"
        size={1}
        maxLength={1}
        className={"pIqaD " + (focus === "knownLetter_" + i ? "focus" : "")}
        value={knownLetters[i] || ""}
        onFocus={(e) => setFocus(e.target.id)}
        onChange={(e) => {
          const letters = [...knownLetters];
          letters[i] = e.target.value;
          setKnownLetters(letters);
        }}
      />
    );
  }

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
      <div>
        <label htmlFor="knownLetter_1">Known letters:</label>
        {knownLetterInputs}
      </div>
      <div>
        <label htmlFor="includeLetters">Include letters:</label>
        <input
          id="includeLetters"
          type="text"
          className={"pIqaD " + (focus === "includeLetters" ? "focus" : "")}
          value={includeLetters}
          onFocus={(e) => setFocus(e.target.id)}
          onChange={(e) => setIncludeLetters(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="excludeLetters">Exclude letters:</label>
        <input
          id="excludeLetters"
          type="text"
          className={"pIqaD " + (focus === "excludeLetters" ? "focus" : "")}
          value={excludeLetters}
          onFocus={(e) => setFocus(e.target.id)}
          onChange={(e) => setExcludeLetters(e.target.value)}
        />
      </div>
      <div>
        <input
          id="noRepeatLetters"
          type="checkbox"
          checked={noRepeatLetters}
          onChange={(e) => setNoRepeatLetters(e.target.checked)}
        />
        <label htmlFor="noRepeatLetters">No repeat letters</label>
      </div>
      <div>
        <input
          type="button"
          onClick={(e) => {
            setIncludeLetters("");
            setExcludeLetters("");
            setKnownLetters([]);
          }}
          value="Reset"
        />
      </div>
      <div className="keyboard">{rows}</div>
      <div>Total words found: {totalWords.length}.</div>
      <div>{wordList}</div>
      <hr />
      <div>
        <strong>
          <a href="https://github.com/lostcarpark/tlhingan">tlhingan mu' pu'</a>
        </strong>{" "}
        developed by James Shields and released under the MIT software licence.
        Word list from Peter Musabi's{" "}
        <a href="https://github.com/PanderMusubi/klingon">
          Klingon word project
        </a>
        . Makes use of{" "}
        <a href="https://www.evertype.com/fonts/tlh/">Klingon pIqaD HaSta</a>{" "}
        designed by Mike Neff and updated by Michael Everson.
      </div>
    </div>
  );
}

export default App;
