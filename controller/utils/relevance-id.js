const { updateGoogle } = require("../../google-engine/google-api");


const getRandomWord = (wordList, language = 'en', column) => {
  // wordList = wordList.filter(([phrase, meaning, relevance, number]) => relevance);

  wordList = wordList.map(([phrase, meaning, relevance, number]) => [
    phrase.trim().toLowerCase(),
    meaning || 'missing value',
    relevance || '50',
    number
  ]);


  // console.log( wordList.slice(0))
  // Calculate the sum of all relevance weights
  const totalWeight = wordList
    .slice(1)
    .reduce((sum, word) => sum + Number(word[2]), 0);

  // Generate a random value between 0 and the total weight
  const randomValue = Math.random() * totalWeight;

  // Roulette Wheel Selection
  let cumulativeWeight = 0;
  for (let i = 1; i < wordList.length; i++) {
    // Accessing word relevance using index [2]
    cumulativeWeight += Number(wordList[i][2]);
    if (randomValue <= cumulativeWeight) {
       
      // Return the chosen combination along with its index in an object
      
      let newRelevance = wordList[i][2] - 5;
      let num = wordList[i][3]

      if (newRelevance < 5) {
        newRelevance = 5;
      }

      // Return the chosen combination along with its index in an object
      updateGoogle(newRelevance, num, language, column);

      

      return {
        index: i,
        word: wordList[i][0],
        description: wordList[i][1],
        relevance: wordList[i][2],
      };
    }
  }
};

module.exports = {
  getRandomWord,
};
