/***
 * parser.js
 * Contains all functionality related to parsing input files.
 */

/** A regex that matches [ and ]. */
var MATCH_SQUARE_BRACKETS_REGEX = /[\[\]']+/g;

/** A regex that matches whitespace. */
var MATCH_WHITESPACE_REGEX = /\s/g;

/** Delimiters for the GNU Octave dense matrix format. */
var DENSE_ROW_DELIM = ';';
var DENSE_COL_DELIM = ',';

/** A regex that matches dense matrices. */
var IDENTIFY_DENSE_STR = '\\s*\\[';
var IDENTIFY_DENSE_REGEX = new RegExp(IDENTIFY_DENSE_STR);

/** A regex that matches sparse matrices in the input format. */
var IDENTIFY_SPARSE_REGEX = new RegExp(IDENTIFY_DENSE_STR + IDENTIFY_DENSE_STR);

/** A regex that matches a single value in the sparse matrix input format. */
var SPARSE_MATRIX_VALUE_REGEX = /\[(\d*),(\d*),(-?\d*\.?\d*)\]/g;

/** */
var SPARSE_REGEX_ROW_INDEX = 1;
var SPARSE_REGEX_COL_INDEX = 2;
var SPARSE_REGEX_VAL_INDEX = 3;

/** The default value for the sparse matrix. */
var DEFAULT_SPARSE_MATRIX_PARSE_VAL = 0;

/** An enum for the various matrix types. */
var MATRIX_TYPE = {
    DENSE: "Dense",
    SPARSE: "Sparse",
    UNRECOGNIZED: "Unrecognized matrix type"
};

/**
 * Given an input string, returns the type of matrix it represents.
 * @param str - the input string.
 * @returns {*} - the matrix type.
 */
function getInputMatrixType(str) {
    if (IDENTIFY_SPARSE_REGEX.test(str)) {
        return MATRIX_TYPE.SPARSE;
    }

    if (IDENTIFY_DENSE_REGEX.test(str)) {
        return MATRIX_TYPE.DENSE;
    }

    return MATRIX_TYPE.UNRECOGNIZED;
}

/**
 * Given a string of a matrix in the GNU octave format, creates and returns.
 * @param str - the string representation of the matrix.
 * @param parseToString - true if to return the values as strings, false for floats.
 * @returns {*} - the matrix.
 */
function parseDenseMatrix(str, parseToString) {
    var M,
        row,
        col;

    if (parseToString === undefined) {
        parseToString = false;
    }

    M = str.replace(MATCH_SQUARE_BRACKETS_REGEX, '').replace(MATCH_WHITESPACE_REGEX, '').split(DENSE_ROW_DELIM);

    // split each row into the proper columns
    for (row = 0; row < M.length; row++) {
        M[row] = M[row].split(DENSE_COL_DELIM);

        if (!parseToString) {
            for (col = 0; col < M[row].length; col++) {
                M[row][col] = parseFloat(M[row][col]);
            }
        }
    }

    return M;
}

/**
 * Given a string of a sparse matrix, creates and returns it.
 * @param str - the string representation of the matrix.
 * @returns {*} - the matrix.
 */
function parseSparseMatrix(str) {
    var val,
        col,
        row,
        prevRow,
        prevDiagonalIndex,
        regexMatch,
        columnData,
        matrixData,
        diagonalIndices;

    str = str.replace(MATCH_WHITESPACE_REGEX, '');

    prevRow = 0;
    prevDiagonalIndex = 0;
    matrixData = [];
    diagonalIndices = [];
    columnData = [];
    while ((regexMatch = SPARSE_MATRIX_VALUE_REGEX.exec(str)) !== null) {
        val = parseFloat(regexMatch[SPARSE_REGEX_VAL_INDEX]);
        col = parseInt(regexMatch[SPARSE_REGEX_COL_INDEX]);
        row = parseInt(regexMatch[SPARSE_REGEX_ROW_INDEX]);

        if (col < row) {
            continue;
        } else if (row === col) {
            // add zeros to the diagonal in case they are needed
            for (; prevDiagonalIndex < col - 1; prevDiagonalIndex++) {
                diagonalIndices.push(matrixData.length);
                matrixData.push(DEFAULT_SPARSE_MATRIX_PARSE_VAL);
            }

            diagonalIndices.push(matrixData.length);
            matrixData.push(val);

            // add column values
            matrixData = matrixData.concat(columnData);

            // prepare everything for the new column to add
            columnData = [];
            prevDiagonalIndex = col;
        } else {
            // add zeros to the column in case they are needed
            for (; prevRow < row - 1; prevRow++) {
                columnData.unshift(DEFAULT_SPARSE_MATRIX_PARSE_VAL);
            }

            columnData.unshift(val);
        }

        prevRow = row;
    }

    return new SparseMatrix(matrixData, diagonalIndices);
}