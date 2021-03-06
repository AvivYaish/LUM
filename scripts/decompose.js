/***
 * decompose.js
 * Contains all the various methods for dense matrices.
 */

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
 * @returns {*} M with its i and j rows switched.
 */
function switchRows(M, i, j) {
    var tmp = M[i];
    M[i] = M[j];
    M[j] = tmp;
    return M;
}

/**
 * @param M The matrix to produce an RREF for.
 * @return Array M in RREF.
 */
function findRREF(M) {
    var curColumn = 0,
        curRow,
        height = M.length,
        width = M[0].length,
        i,
        j,
        stop = false,   // whether or not to stop the main loop
        val;            // will be used for row elimination

    for (curRow = 0; curRow < height; curRow++) {
        if (width <= curColumn) {
            break;
        }

        // find first row which has a non zero value on the current column
        i = curRow;
        while ((M[i][curColumn] == 0) && (!stop)) {
            i++;
            if (height == i) {
                i = curRow;
                curColumn++;
                if (width == curColumn) {
                    stop = true;
                }
            }
        }
        if (stop) {
            break;
        }

        // switch rows if needed
        M = switchRows(M, i, curRow);

        // normalize the row
        val = M[curRow][curColumn];
        for (j = 0; j < width; j++) {
            M[curRow][j] /= val;
        }

        // zero out the column
        for (i = 0; i < height; i++) {
            if (i == curRow) {
                continue;
            }
            val = M[i][curColumn];
            for (j = 0; j < width; j++) {
                M[i][j] -= val * M[curRow][j];
            }
        }
        curColumn++;
    }

    return [[], ["RREF of", M]];
}

/**
 * @returns {*} The nullspace of matrix M.
 */
function findNullspace(M) {
    // finds the nullspace by computing the column echelon form by
    // Gaussian elimination, so need to transpose the input matrix
    // and use the RREF algorithm.
    M = math.transpose(M);
    var curColumn = 0,
        curRow,
        height = M.length,
        width = M[0].length,
        i,
        j,
        stop = false,           // whether or not to stop the main loop
        I = math.eye(height),   // the matrix that will contain the nullspace base
        val,                    // will be used for row elimination
        nullspace = [];


    for (curRow = 0; curRow < height; curRow++) {
        if (width <= curColumn) {
            break;
        }

        // find first row which has a non zero value on the current column
        i = curRow;
        while ((M[i][curColumn] == 0) && (!stop)) {
            i++;
            if (height == i) {
                i = curRow;
                curColumn++;
                if (width == curColumn) {
                    stop = true;
                }
            }
        }
        if (stop) {
            break;
        }

        // switch rows if needed
        M = switchRows(M, i, curRow);
        I = switchRows(I, i, curRow);

        // normalize the row
        val = M[curRow][curColumn];
        for (j = 0; j < width; j++) {
            M[curRow][j] /= val;
        }

        // zero out the column
        for (i = 0; i < height; i++) {
            if (i == curRow) {
                continue;
            }
            val = M[i][curColumn];
            for (j = 0; j < width; j++) {
                M[i][j] -= val * M[curRow][j];
                I[i][j] -= val * I[curRow][j];
            }
        }
        curColumn++;
    }

    // advance until we arrive to the columns which are a combination of the previous ones
    for (i = 0; (i < height) && (i < width) && (M[i][i] == 1); i++) {}
    // take only the corresponding columns from I
    for (; i < height; i++) {
        nullspace.push(I[i]);
    }
    return [[], ["Nullspace of", math.transpose(nullspace)]];
}

/**
 * @returns {*[]} The projection of v on the basis.
 */
function projectVec(v, basis) {
    var projection = [],    // will hold the projection of v on the basis
        unitVec,            // the unit vector of the current vector in basis
        norm;               // the norm of the current vector in basis

    for (var i = 0; i < basis.length; i++) {
        // calculate the norm
        norm = 0;
        for (var j = 0; j < basis[i].length; j++) {
            norm += Math.pow(basis[i][j], 2);
        }
        norm = sqrt(norm);

        unitVec = math.divide(basis[i], norm);

        projection.push(math.multiply(math.multiply(v, unitVec),
                        unitVec));
    }

    return [[], projection];
}

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

    for (var col = 0; col < M[0].length; col++) {
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
        logM = [],      // a log of the A matrices
        row;

    // note that L starts empty, and in each iteration we add a single column to it.
    for (row = 0; row < n; row++) {
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
    for (row = 0; row < n - 1; row++) {
        for (var col = row + 1; col < n; col++) {
            L[row][col] = 0;
        }
    }

    return [[["A", logM]], ["sanity", math.multiply(L, math.multiply(D, math.transpose(L)))], ["L", L], ["D", D]];
}