math.config({matrix: 'array'});
var LOG_L_CELL = 0;

/**
 * @param M input matrix.
 * @return P a matrix such that P*M is a matrix that has an LU decomposition.
 */
function getRowSwapMatrix(M) {
    // Moving rows such that each column's max value is on the diagonal ensures us the
    // resulting matrix has a LU decomposition. The function will search for the max
    // value in each column and will generate the P matrix
    var P = math.eye(M.length);  // the P matrix is initially the identity matrix

    for (var col = 0; col < M.length; col++) {
        var maxRow = col;
        
        // search for max value
        for (var row = col; row < M.length; row++) {
            if (M[row][col] > M[maxRow][col]) {
                maxRow = row;
            }
        }
        
        // change the P matrix according to the max value's row
        if (maxRow != col) {
            var temp = P[col];
            P[col] = P[maxRow];
            P[maxRow] = temp;
        }
    }
    return P;
}

/**
 * @param M matrix to decomposePLU.
 * @param swapRows if false, decomposes M to LU matrices. Otherwise, to PLU matrices.
 * @return Object [[L0, L1, L2, ...], [U0, U1, U2, ...]] that also has a P attribute
 */
function decomposePLU(M, swapRows) {
    var logL = [],  // keeps a log of the L matrices
        logU = [],  // log of U matrices
        curL,       // the current L matrix
        P;          // the P matrix

    if (swapRows) {
        P = getRowSwapMatrix(M);
        M = math.multiply(P, M);
    }

    logL.push(math.eye(M.length));
    logU.push(math.clone(M));

    for (var col = 0; col < M.length - 1; col++) {
        curL = math.eye(M.length);

        // generate the curL matrix, and use it to zero out the current column in U
        for (var row = col + 1; row < M.length; row++) {
            if (M[row][col] !== 0) {
                curL[row][col] = M[row][col] / M[col][col];
                M[row] = math.add(M[row], math.multiply(-curL[row][col], M[col]));
            }
        }
        // notice that L*curL gives the L matrix for this decomposition stage
        logL.push(math.multiply(logL[col], curL));
        logU.push(math.clone(M));
    }

    // remove the first elements that aren't needed
    logL.shift();
    logU.shift();

    // create return object
    var toReturn = [logL, logU];
    toReturn.P = P;
    return toReturn;
}

/**
 * Based on the algorithm in p. 139 of Matrix Computations by Golub-Van Loan
 * @param M The input matrix.
 * @return Array [[A0, A1, A2, ...], [V0, V1, V2, ...]]
 */
function decomposeLDL(M) {
    var n = M.length,
        matrixIndex,// an index used for matrix operations
        firstRange, // a temp range used for matrix operations
        secRange,   // another one
        v,          // temporary matrix used for computation
        logA = [],  // a log of the A matrices
        logV = [];  // a log of the V matrices

    for (var row = 0; row < n; row++) {
        // compute v
        v = math.zeros(row + 1);
        for (var col = 0; col < row; col++) {
            v[col] = M[row][col] * M[col][col];
        }
        v[row] = M[row][row];
        if (row > 0) {
            firstRange = math.range(0, row);
            v[row] -= math.multiply(
                        math.subset(M, math.index(row, firstRange)),
                        math.subset(v, math.index(firstRange))
                      );
        }
        if (v[row] === 0) {
            return [];  // No LU factorization, can't continue!
        }
        logV.push([math.clone(v)]);  // need to insert into array so the printing will work alright

        M[row][row] = v[row];  // store the current diagonal value for M

        // compute L(row+1:n, row). if row == n-1, nothing more to compute
        if (row === n - 1) {
            continue;
        }
        firstRange = math.range(row + 1, n);        // j + 1:n
        matrixIndex = math.index(firstRange, row);  // (j+1:n, j)

        // if this is the first row, no need to preform the subtraction in the algorithm
        if (row === 0) {
            M = math.subset(M, matrixIndex, math.divide(math.subset(M, matrixIndex), v[row]));
        } else {
            secRange = math.range(0, row);  // (1:j-1)
            M = math.subset(M, matrixIndex,
                math.divide(
                    math.subtract(
                        math.subset(M, matrixIndex),
                        math.multiply(
                            math.subset(M, math.index(firstRange, secRange)),
                            math.subset(v, math.index(secRange)))),
                    v[row])
            );
        }
        logA.push(math.clone(M));
    }
    return [logA, logV];
}