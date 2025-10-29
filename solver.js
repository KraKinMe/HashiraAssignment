const { log } = require("console");
const fs = require("fs");

function parseBigInt(value, base) {
  const baseN = BigInt(base);
  let result = 0n;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    const digit = parseInt(char, 36);

    if (digit >= base) {
      throw new Error(`Invalid digit '${char}' for base ${base} in value '${value}'`);
    }

    result = result * baseN + BigInt(digit);
  }
  return result;
}

function solveSystem(A, b) {
  const n = A.length;
  const matrix = A.map((row) => [...row]);
  const vector = [...b];

  for (let p = 0; p < n; p++) {
    let maxRow = p;
    for (let i = p + 1; i < n; i++) {
      const absVal = matrix[i][p] < 0n ? -matrix[i][p] : matrix[i][p];
      const maxVal = matrix[maxRow][p] < 0n ? -matrix[maxRow][p] : matrix[maxRow][p];
      if (absVal > maxVal) {
        maxRow = i;
      }
    }

    [matrix[p], matrix[maxRow]] = [matrix[maxRow], matrix[p]];
    [vector[p], vector[maxRow]] = [vector[maxRow], vector[p]];

    const pivot = matrix[p][p];
    if (pivot === 0n) {
      throw new Error("Matrix is singular, no unique solution exists.");
    }

    for (let i = p + 1; i < n; i++) {
      const factor = matrix[i][p];
      vector[i] = vector[i] * pivot - vector[p] * factor;

      for (let j = p; j < n; j++) {
        matrix[i][j] = matrix[i][j] * pivot - matrix[p][j] * factor;
      }
    }
  }

  const coefficients = new Array(n).fill(0n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0n;
    for (let j = i + 1; j < n; j++) {
      sum = sum + matrix[i][j] * coefficients[j];
    }
    coefficients[i] = (vector[i] - sum) / matrix[i][i];
  }

  return coefficients;
}

function solvePolynomial(jsonString) {
  const data = JSON.parse(jsonString);

  const k = data.keys.k;
  const m = k - 1;

  const matrix = [];
  const vector = [];

  for (let i = 0; i < k; i++) {
    const key = String(i + 1);

    if (!data[key]) {
      throw new Error(`Missing data for key '${key}', which is required (k=${k})`);
    }

    const x = BigInt(key);
    const y = parseBigInt(data[key].value, data[key].base);
    vector.push(y);

    const row = [];
    let currentPower = 1n;
    for (let j = 0; j <= m; j++) {
      row.push(currentPower);
      currentPower = currentPower * x;
    }
    matrix.push(row.reverse());
  }

  const coefficients = solveSystem(matrix, vector);

  const constantValue = coefficients[m];
  
  console.log("The constant value is:", constantValue.toString());
}

// Yahan par filepath me aap apna JSON file ka path de sakte hain.

const filePath = process.argv[2] || "./testcase2.json"; 

// Check if filePath is provided

if (!filePath) {
  console.error("Error: Please provide the path to the JSON test case file.");
  process.exit(1); 
}

try {
  const jsonString = fs.readFileSync(filePath, "utf8");
  solvePolynomial(jsonString);

} catch (error) {
  if (error.code === "ENOENT") {
    console.error(`Error: File not found at path: ${filePath}`);
  } else if (error instanceof SyntaxError) {
    console.error(`Error: Invalid JSON in file: ${filePath}`);
    console.error(error.message);
  } else {
    console.error(`An error occurred: ${error.message}`);
  }
}