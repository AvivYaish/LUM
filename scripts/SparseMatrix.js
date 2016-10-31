
/***
 * SparseMatrix.js
 * An implementation of a symmetric sparse matrix,
 * and various methods useful for such matrices.
 */

/**
 * A constructor for a symmetric sparse matrix.
 * @param data - the values held in the matrix, ordered in a
 *               column-oriented diagonal first manner.
 * @param diagonalIndices - the indices of the diagonal values
 *                          of the matrix.
 * @constructor
 */
function SparseMatrix(data, diagonalIndices) {
    // done according to the format specified in
    // p.15 in Week_10_LDL_maria100107

    this._data = data;
    this._diagonalIndices = diagonalIndices;

    // _n holds the column/row number of the matrix.
    this._n = diagonalIndices.length;

    // _m hols the skyline of the matrix, called according
    // to the convention in p.3 of Week_10_LDL_maria100107
    this._m = this._getSkyline();
}

/**
 * Given a symmetrical dense matrix, returns a sparse
 * matrix representation of it.
 * @param denseM - the dense matrix to convert to sparse.
 * @constructor
 */
SparseMatrix.fromDense = function (denseM) {
    var data,
        diagonalIndices,
        row,
        col,
        trailingZerosNum;

    data = [];
    diagonalIndices = new Array(denseM.length);

    for (col = 0; col < denseM.length; col++) {
        // insert the current diagonal value
        diagonalIndices[col] = data.length;
        data.push(denseM[col][col]);

        // counts the upper trailing zeros of the column
        for (trailingZerosNum = 0;
             (trailingZerosNum < col -1) && (denseM[trailingZerosNum][col] == 0);
             trailingZerosNum++) {}

        // insert the current column
        for (row = col - 1; row >= trailingZerosNum; row--) {
            data.push(denseM[row][col]);
        }
    }

    return new SparseMatrix(data, diagonalIndices);
};

/**
 * @returns {Array} - a dense matrix representation of
 *                    this symmetrical sparse matrix.
 */
SparseMatrix.prototype.toDense = function() {
    var dense,  // this will hold the dense representation of this matrix
        row,
        col;

    dense = new Array(this._n);

    for (row = 0; row < this._n; row++) {
        dense[row] = new Array(this._n);

        for (col = 0; col < this._n; col++) {
            dense[row][col] = this.getElem(row, col);
        }
    }

    return dense;
};

/**
 * @returns {Array} - the skyline of this matrix.
 * @private
 */
SparseMatrix.prototype._getSkyline = function() {
    var m,      // this will hold the skyline
        col;

    m = new Array(this._n);

    for (col = 0; col < this._n - 1; col++) {
        m[col] = col - (this._diagonalIndices[col + 1] - this._diagonalIndices[col] - 1);
    }
    m[this._n - 1] = col - (this._data.length - this._diagonalIndices[this._n - 1] - 1);

    return m;
};

/**
 * Performs an in place LDLt on this matrix.
 * @returns {SparseMatrix} - this matrix, after the LDLt.
 */
SparseMatrix.prototype.LDLt = function() {
    var col,
        row,
        r,
        curGIndex;

    if (this._n === 0) {
        return this;
    }

    for (col = 1; col < this._n; col++) {
        for (row = this._m[col]; row < col; row++) {

            // updating the g values
            curGIndex = this._getIndex(row, col);
            for (r = Math.max(this._m[col], this._m[row]); r < row; r++) {
                this._data[curGIndex] -=
                    this._data[this._getIndex(r, row)] * this._data[this._getIndex(r, col)];
            }
        }

        // replacing the g values with L values
        for (row = this._m[col]; row < col; row++) {
            this._data[this._getIndex(row, col)] /= this._data[this._diagonalIndices[row]];
        }

        // updating D
        for (r = this._m[col]; r < col; r++) {
            this._data[this._diagonalIndices[col]] -=
                Math.pow(this._data[ this._getIndex(r, col)], 2) * this._data[this._diagonalIndices[r]];
        }
    }

    return this;
};

/**
 * @param row - row of value.
 * @param col - column of value.
 * @returns {number} - the _data index for the requested value.
 * @private
 */
SparseMatrix.prototype._getIndex = function(row, col) {
    return this._diagonalIndices[col] + col - row;
};

/**
 * @param row - row of value.
 * @param col - column of value.
 * @returns {*} - the requested value, or undefined if
 *                the index is out of bounds.
 */
SparseMatrix.prototype.getElem = function(row, col) {
    var temp;

    if ((row >= this._n) || (col >= this._n)) {
        return undefined;
    }

    if (col < row) {
        temp = col;
        col = row;
        row = temp;
    }

    if (row < this._m[col]) {
        return 0;
    }

    return this._data[this._getIndex(row, col)];
};

/**
 * @returns {string} - a string representation of this matrix.
 */
SparseMatrix.prototype.toString = function() {
    var str,
        row,
        col;

    str = "";

    for (row = 0; row < this._n; row++) {
        for (col = 0; col < this._n; col++) {
            str += this.getElem(row, col).toString() + "\t";
        }
        str += "\n";
    }

    return str;
};
