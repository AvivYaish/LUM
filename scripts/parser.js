/***
 * parser.js
 * Contains all functionality related to parsing input files.
 */

//
var MATCH_BRACKETS_REGEX = /[\[\]']+/g;

//
var MATCH_WHITESPACE_REGEX = /\s/g;

/** Delimiters for the GNU Octave dense matrix format. */
var DENSE_ROW_DELIM = ';';
var DENSE_COL_DELIM = ',';

//
var IDENTIFY_DENSE_STR = "\s*\[";

//
var IDENTIFY_DENSE_REGEX = new RegExp(IDENTIFY_DENSE_STR);

//
var IDENTIFY_SPARSE_REGEX = new RegExp(IDENTIFY_DENSE_STR + IDENTIFY_DENSE_STR);

//
var MATRIX_VAL_REGEX_STR = "\s*-?\d*\.?\d*\s*";

//
var DENSE_MATRIX_INPUT_REGEX =
    new RegExp("\[((" + MATRIX_VAL_REGEX_STR + ")(," + MATRIX_VAL_REGEX_STR + ")*;?)+\]");


//
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
 * @param parseAsNumbers
 * @returns {*}
 */
function parseDenseMatrix(str, parseAsNumbers) {
    var M;

    if (parseAsNumbers === undefined) {
        parseAsNumbers = false;
    }

    M = str.replace(MATCH_WHITESPACE_REGEX).split(DENSE_ROW_DELIM);

    // split each row into the proper columns
    for (var row = 0; row < M.length; row++) {
        M[row] = M[row].split(COL_DELIM);
    }

    return M;
}

/**
 *
 * @param str
 * @returns {*}
 */
function parseSparseMatrix(str) {
    var M;

    str.replace(MATCH_WHITESPACE_REGEX).split(DENSE_ROW_DELIM);

    return M;
}