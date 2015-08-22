math.config({matrix: 'array'});
var LOG_L_CELL = 0;
var LOG_U_CELL = 1;
var P_CELL = 2;

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
 * @param M matrix to decompose.
 * @param swapRows if false, decomposes M to LU matrices. Otherwise, to LPU matrices.
 * @return Array [[L0, L1, L2, ...], [U0, U1, U2, ...], P]
 */
function decompose(M, swapRows) {
    var logL = [], logU = [], curL, P;

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
    return [logL, logU, P];
}