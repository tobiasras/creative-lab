let mlbClasses, labelIndex, svdComponents;

Promise.all([
  fetch("assets/data/mlb_classes.json").then(res => res.json()),
  fetch("assets/data/svd_components.json").then(res => res.json())
]).then(([mlb, svdRaw]) => {
  mlbClasses = mlb;
  labelIndex = Object.fromEntries(mlbClasses.map((label, i) => [label, i]));

  // Transpose svdRaw matrix (so we can apply SVD as a projection)
  svdComponents = svdRaw[0].map((_, colIndex) =>
    svdRaw.map(row => row[colIndex])
  );

  console.log("SVD and label index ready.");
});


function oneHotEncode(nerEntry, labelIndex, vocabSize) {
  const vec = new Array(vocabSize).fill(0);

  nerEntry.forEach(token => {
    const normalized = token.toLowerCase().trim();
    if (normalized in labelIndex) {
      vec[labelIndex[normalized]] = 1;
    }
  });

  return vec;
}
function applySVD(oneHot, svdMatrix) {
  return svdMatrix[0].map((_, i) =>
    oneHot.reduce((sum, val, j) => sum + val * svdMatrix[j][i], 0)
  );
}


export function transform(entry) {
  if (!mlbClasses || !labelIndex || !svdComponents) {
    throw new Error("SVD model not loaded yet.");
  }

  const oneHot = oneHotEncode(entry, labelIndex, mlbClasses.length);
  const reducedVector = applySVD(oneHot, svdComponents);
  
  return reducedVector;
}

