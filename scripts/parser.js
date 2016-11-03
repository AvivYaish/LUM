/***
 * parser.js
 * Contains all functionality related to parsing input files.
 */

//
var NATURAL_REGEX_STR = "\s*\d\s*";

//
var INT_REGEX_STR = "\s*-?\d*\.?\d*\s*";

//
var FLOAT_REGEX_STR = "\s*-?\d*\.?\d*\s*";

//
var DENSE_MATRIX_INPUT_REGEX =
    new RegExp("\[((" + INT_REGEX_STR + ")(," + INT_REGEX_STR + ")*;?)+\]");

var SPARSE_MATRIX_SINGLE_CELL_REGEX_STR =
    "(\s*\[" + NATURAL_REGEX_STR + "," + NATURAL_REGEX_STR + "," + FLOAT_REGEX_STR + "\])";

//
var SPARSE_MATRIX_INPUT_REGEX =
    new RegExp("\[" + SPARSE_MATRIX_SINGLE_CELL_REGEX_STR +
        "(\s*," + SPARSE_MATRIX_SINGLE_CELL_REGEX_STR + "*\s*\]");