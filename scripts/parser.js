/***
 * parser.js
 * Contains all functionality related to parsing input files.
 */

/** */
var MATCH_SQUARE_BRACKETS_REGEX = /[\[\]']+/g;

/** */
var MATCH_WHITESPACE_REGEX = /\s/g;

/** Delimiters for the GNU Octave dense matrix format. */
var DENSE_ROW_DELIM = ';';
var DENSE_COL_DELIM = ',';

/** */
var SPARSE_VALUE_DELIM = ',';

/** */
var IDENTIFY_DENSE_STR = '\\s*\\[';

/** */
var IDENTIFY_DENSE_REGEX = new RegExp(IDENTIFY_DENSE_STR);

/** */
var IDENTIFY_SPARSE_REGEX = new RegExp(IDENTIFY_DENSE_STR + IDENTIFY_DENSE_STR);

/** */
var MATRIX_VAL_REGEX_STR = "\\s*-?\\d*\\.?\\d*\\s*";

/** */
var DENSE_MATRIX_INPUT_REGEX =
    new RegExp("\\[((" + MATRIX_VAL_REGEX_STR + ")(," + MATRIX_VAL_REGEX_STR + ")*;?)+\\]");

/** */
var DENSE_MATRIX_INPUT_VALUE_REGEX = new RegExp();


/** */
var MATRIX_TYPE = {
    DENSE: "Dense",
    SPARSE: "Sparse",
    UNRECOGNIZED: "Unrecognized matrix type"
};

/**
 *
 * @param str
 * @returns {*}
 */
function getInputMatrixType(str) {
    if (IDENTIFY_DENSE_REGEX.test(str)) {
        return MATRIX_TYPE.DENSE;
    }

    if (IDENTIFY_SPARSE_REGEX.test(str)) {
        return MATRIX_TYPE.SPARSE;
    }

    return MATRIX_TYPE.UNRECOGNIZED;
}

/**
 *
 * @param str
 * @param parseToString
 * @returns {*}
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
 *
 * @param str
 * @returns {*}
 */
function parseSparseMatrix(str) {
    var M,
        stringValues,
        i,
        matrixValues,
        diagonalIndices;

    stringValues = str.replace(MATCH_WHITESPACE_REGEX, '').split(SPARSE_VALUE_DELIM);

    for (i = 0; i < stringValues.length; i++) {

    }

    return M;
}