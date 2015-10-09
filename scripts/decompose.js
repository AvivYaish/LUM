math.config({matrix: 'array'});

/***
 * Notice the structure of the result matrices in all decomposition algorithms is:
 * [
 *  [
 *   [stepByStepMatrix1 name, stepByStepMatrix1 data],
 *   [stepByStepMatrix2 name, stepByStepMatrix2 data],
 *   ...
 *  ],
 *  [extrasMatrix1 name, extrasMatrix1 data],
 *  [extrasMatrix2 name, extrasMatrix2 data],
 *  ...
 * ]
 */

/** The first result matrix in the results. */
var FIRST_RESULT_MATRIX = 0;

/** The result to return if there is no decomposition */
var NO_DECOMP_RESULT = [];

/** The place of the steps matrices in the result */
var STEP_MATRICES_INDEX = 0;

/** The header of a matrix in the results. */
var RESULT_MATRIX_NAME = 0;

/** The data of a matrix in the results. */
var RESULT_MATRIX_DATA = 1;

/**
 * @param M Matrix to decompose into LU components.
 * @return Array Result matrices.
 */
function decomposeLU(M) {
    var logL = [],  // keeps a log of the L matrices
        logU = [],  // log of U matrices
        curL;       // the current L matrix

    logL.push(math.eye(M.length));
    logU.push(math.clone(M));

    for (var col = 0; col < M.length - 1; col++) {
        curL = math.eye(M.length);

        // need to divide by M[col][col], so if it's 0 decomposition is impossible!
        if (M[col][col] === 0) {
            return NO_DECOMP_RESULT;
        }

        // generate the curL matrix, and use it to zero out the current column in U
        for (var row = col + 1; row < M.length; row++) {
            if (M[row][col] !== 0) {
                curL[row][col] = M[row][col] / M[col][col];
                M[row] = math.add(M[row], math.multiply(-curL[row][col], M[col]));
            }
        }

        // log the matrices.
        // notice that L*curL gives the L matrix for this decomposition stage
        logL.push(math.multiply(logL[col], curL));
        logU.push(math.clone(M));
    }

    // remove the first elements that aren't needed
    logL.shift();
    logU.shift();

    return [[["L", logL], ["U", logU]]];
}

/**
 * Moving rows such that each column's max value is on the diagonal ensures us the
 * resulting matrix has a LU decomposition. The function will search for the max
 * value in each column and will generate the P matrix.
 * @param M input matrix.
 * @return P a matrix such that P*M is a matrix that has an LU decomposition.
 */
function generateP(M) {
    var P = math.eye(M.length), // the P matrix is initially the identity matrix
        maxRow,                 // the row containing the maximum value
        temp;

    for (var col = 0; col < M.length; col++) {
        maxRow = col;

        // search for max value
        for (var row = col; row < M.length; row++) {
            if (M[row][col] > M[maxRow][col]) {
                maxRow = row;
            }
        }

        // change the P matrix according to the max value's row
        if (maxRow != col) {
            temp = P[col];
            P[col] = P[maxRow];
            P[maxRow] = temp;
        }
    }
    return P;
}

/**
 * @param M Matrix to decompose into PLU components.
 * @return Array Result matrices.
 */
function decomposePLU(M) {
    var P = generateP(M),
        results = decomposeLU(math.multiply(P, M));
    if (results === NO_DECOMP_RESULT) {
        return NO_DECOMP_RESULT;
    }
    results.push(["P", P]);
    return results;
}

/**
 * Performs the outer product (dyadic product) of vectors, as defined by Butler in p. 324.
 * @param u Input vector.
 * @param v Input Vector.
 * @return {*} u x v
 */
function outerProduct(u ,v) {
    var M = math.zeros(u.length, v.length);
    for (var row = 0; row < u.length; row++) {
        for (var col = 0; col < v.length; col++) {
            M[row][col] = u[row] * v[col];
        }
    }
    return M;
}

/**
 * Performs an LDLt decomposition, even if there are zeros on the diagonal.
 * @param M Matrix to decompose into LDLt components.
 * @return Array Result matrices.
 */
function decomposeLDL(M) {
    var n = M.length,
        L = [],
        D = math.eye(n),
        curColIndex,    // the indices for the current column
        curColValues,   // the values of the current column
        logM = [];      // a log of the A matrices

    // note that L starts empty, and in each iteration we add a single column to it.
    for (var row = 0; row < n; row++) {
        D[row][row] = M[row][row];

        // insert to curColIndex the math.js representation for the indices of the current column
        curColIndex = math.index(math.range(0, n), row);

        if (D[row][row] + 1 !== 1) {
            // using curColIndex, the function math.subset will get the current column values from the matrix M
            curColValues = math.subset(M, curColIndex);

            // add a new column to L and update M
            L.push(math.divide(curColValues, D[row][row]));
            M = math.subtract(M, outerProduct(math.squeeze(L[row]), math.squeeze(curColValues)));
        } else {
            // add a new column to L
            L.push(math.zeros(n, 1));
            L[row][row] = [1];
        }

        // log the matrices
        logM.push(math.clone(M));
    }
    
    // notice that L currently looks like this:
    // [[[L11], [L12], ...], [[L21], [L22], ...], ...]
    // squeeze "flattens" each row to look like this: [Li1, Li2, Li3, ...]
    // also, L currently is actually Lt, so transpose it.
    L = math.transpose(math.squeeze(L));

    // now need to zero out everything above the diagonal
    for (var row = 0; row < n - 1; row++) {
        for (var col = row + 1; col < n; col++) {
            L[row][col] = 0;
        }
    }

    return [[["A", logM]], ["L", L], ["D", D]];
}