/***
 * display.js
 * Contains all the dynamic display functionality.
 */

/** Specifies the number of digits to show after the dot. Does not affect
 * computation precision. */
var DIGITS_AFTER_DOT = 3;

/** Alignments of matrices on the screen */
var MATRIX_ALIGN = ['left', 'right'];

/** Max number of matrices in the same row */
var MAX_MATRIX_NUM = MATRIX_ALIGN.length;

/** The initial value for the GUI matrix */
var INIT_GUI_MATRIX_VAL = 0;

/** */
var MATRIX_INPUT_TYPES = {
    DENSE: "dense",
    SPARSE: "sparse"
};

/** */
var OPERATION_TYPES = {
    LU: "LU",
    PLU: "PLU",
    LDLT: "LDLt",
    SPARSE_LDLT: "Sparse LDLt",
    RREF: "RREF",
    NULLSPACE: "Nullspace"
};

/** */
var OPERATIONS_FOR_MATRIX_TYPES = {
    DENSE: new Set([OPERATION_TYPES.LU,
                    OPERATION_TYPES.PLU,
                    OPERATION_TYPES.LDLT,
                    OPERATION_TYPES.RREF,
                    OPERATION_TYPES.NULLSPACE]),

    SPARSE: new Set([OPERATION_TYPES.SPARSE_LDLT])
};

/**
 * If called by a $("#div-name").scrollView(), it scrolls to the div.
 */
function scrollView() {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
}

/**
 * Given the load event, format the file into a matrix based on the GNU Octave
 * specification: [col0, col1, ...; col0, col1, ...; ....]
 * Where ; is the row delimiter, and , is the column delimiter.
 * @param event Load event.
 */
function loadFile(event) {
    var matrix = event.target.result;

    switch (getInputMatrixType(matrix)){
        case MATRIX_TYPE.DENSE: {
            drawDenseMatrixInput(undefined, parseDenseMatrix(matrix));
            break;
        }
        case MATRIX_TYPE.SPARSE: {
            drawSparseMatrixInput(undefined, matrix);
            break;
        }
        default: {
            $("#matrix-data").html("Bad input file.");
            break;
        }
    }
}

/**
 * Handles dropping a file into the drop-zone.
 * @param event File dropping event.
 */
function handleFileSelect(event) {
    var file,
        reader;

    event.stopPropagation();
    event.preventDefault();
    $("#matrix-data").html('');

    file = event.dataTransfer.files[0]; // FileList object.
    reader = new FileReader();

    $("#list").html('<ul>File selected: <br><li><strong>' + encodeURI(file.name) + '</li></ul>');
    reader.onload = loadFile;
    reader.readAsText(file);
}

/**
 * Handles dragging files over the drop-zone.
 * @param event Dragging event.
 */
function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

/**
 * Draws the input table for the input dense matrix.
 * @param event Received if this is called by the event listener.
 * @param M A matrix with the default values to use for the input.
 */
function drawDenseMatrixInput(event, M) {
    var rowNum, colNum;   // size of input matrix

    // Determine if the function was called by an event listener or by loadFile
    if (typeof(event) === 'undefined') {  // loadFile, need to set the matrix size
        $("#row-num").val(M.length);
        $("#col-num").val(M[0].length);
    } else {  // event listener
        rowNum = parseInt($("#row-num").val());
        colNum = parseInt($("#col-num").val());
        M = math.zeros(rowNum, colNum);
        $("#list").html("Drop files here");
    }

    $("#matrix-data").html(generateMatrixMarkup(M, true)).attr("matrix-type", MATRIX_INPUT_TYPES.DENSE);
    $("#input-div").show();
}

/**
 * Draws the input table for the input sparse matrix.
 * @param event Received if this is called by the event listener.
 * @param M The sparse matrix.
 */
function drawSparseMatrixInput(event, M) {
    $("#row-num").val(INIT_GUI_MATRIX_VAL);
    $("#col-num").val(INIT_GUI_MATRIX_VAL);

    // Determine if the function was called by an event listener or by loadFile
    if (typeof(event) === 'undefined') {  // loadFile
        // do nothing
    } else {  // event listener
        $("#list").html("Drop files here");
        M = "'Input sparse here! Format: [[row,column,value], ...]'";
    }

    $("#matrix-data").html("<textarea id='sparse-input' cols='60' rows='12'>" +
                            M +
                            "</textarea>").attr("matrix-type", MATRIX_INPUT_TYPES.SPARSE);
    $("#input-div").show();
}

/**
 * Reads the input matrix and returns it.
 * @returns {*} Input matrix.
 */
function readInputMatrix() {
    var M,
        operationType,
        matrixType;

    matrixType = $("#matrix-data").attr("matrix-type");
    operationType = $("#decomposition-type").val();

    switch (matrixType) {
        case MATRIX_INPUT_TYPES.DENSE: {
            M = readInputDenseMatrix();

            if (OPERATIONS_FOR_MATRIX_TYPES.SPARSE.has(operationType)) {
                M = SparseMatrix.fromDense(M);
            }
            break;
        }
        case MATRIX_INPUT_TYPES.SPARSE: {
            M = parseSparseMatrix($("#sparse-input").html());

            if (OPERATIONS_FOR_MATRIX_TYPES.DENSE.has(operationType)) {
                M = M.toDense();
            }
            break;
        }
    }

    return M;
}


/**
 * Reads the input dense matrix and returns it as an array.
 * @return {*} input matrix
 */
function readInputDenseMatrix() {
    var rowNum = parseInt($("#row-num").val()),
        colNum = parseInt($("#col-num").val()),
        M = math.zeros(rowNum, colNum);

    for (var row = 0; row < rowNum; row++) {
        for (var col = 0; col < colNum; col++) {
            M[row][col] = parseFloat($("#" + row + "-" + col + "").val());
        }
    }
    return M;
}

/**
 * Given a matrix M, generate table markup for it's data.
 * @param M The matrix.
 * @param input true if should be a matrix with input, false if not.
 * @return {string}
 */
function generateMatrixMarkup(M, input) {
    var markup = "<table>";
    for (var row = 0; row < M.length; row++) {
        markup += "<tr>";
        for (var col = 0; col < M[row].length; col++) {
            markup += '<td>';

            // format the matrix cell according to it's data and if it is the input matrix
            if (input) {
                markup += '<input id="' + row + '-' + col + '" ' + 'type="text" value="' + M[row][col] + '">';
            } else if (Number.isInteger(M[row][col])) {
                markup +=  M[row][col];
            } else {
                markup += parseFloat(M[row][col].toFixed(DIGITS_AFTER_DOT));
            }

            markup += '</td>';
        }
        markup += "</tr>";
    }
    return markup + "</table>";
}

/**
 * Given an array of step by step matrices, generate table markup for it's data.
 * @param matrices An array of step by step matrices.
 * @return {string}
 */
function generateStepByStepMarkup(matrices) {
    var markup = "<div> <h2>Step by step:</h2> <br>";
    // shows each step of the decomposition process
    for (var step = 0; step < matrices[FIRST_RESULT_MATRIX][RESULT_MATRIX_DATA].length; step++) {
        markup += "<div> <h3 class='clear'>Step " + (step + 1) + "</h3>";
        for (var matrixNum = 0; matrixNum < matrices.length; matrixNum++) {
            markup += "<div class=" + MATRIX_ALIGN[matrixNum % MAX_MATRIX_NUM] + ">" +
                "<h4>" + matrices[matrixNum][RESULT_MATRIX_NAME] + " matrix</h4>" +
                generateMatrixMarkup(matrices[matrixNum][RESULT_MATRIX_DATA][step], false) +
                "</div>";
        }
        markup += "</div>";
    }
    return markup + "</div>";
}

/**
 * Prints the extras matrices (P, L, D, etc').
 * @param result Array containing the result matrices.
 * @return String The markup for the extras matrices.
 */
function generateExtrasMatricesMarkup(result) {
    var markup = "<div>";
    for (var matrixNum = STEP_MATRICES_INDEX + 1; matrixNum < result.length; matrixNum++) {
        markup += "<h3>" + result[matrixNum][RESULT_MATRIX_NAME]  + " matrix:</h3>" +
            generateMatrixMarkup(result[matrixNum][RESULT_MATRIX_DATA], false) + "<br>";
    }
    return markup + "</div>";
}

/**
 * Prints the result matrices.
 * @param result Array containing the result matrices to print.
 * @return String The markup for the result matrices.
 */
function generateResultMatricesMarkup(result) {
    var markup = generateExtrasMatricesMarkup(result);
    if (result[STEP_MATRICES_INDEX].length > 0) {
        markup += "<br>" + generateStepByStepMarkup(result[STEP_MATRICES_INDEX]);
    }
    return  markup;
}

/**
 * Presents the result of the chosen action.
 */
function presentResult() {
    var M,              // the input matrix
        result,         // will hold the result
        resultMarkup,   // the markup for the markup for the result
        operationType;     // the requested operation type

    M = readInputMatrix();
    operationType = $("#decomposition-type").val();

    switch (operationType) {
        case OPERATION_TYPES.PLU:
            result = decomposePLU(M);
            break;
        case OPERATION_TYPES.LU:
            result = decomposeLU(M);
            break;
        case OPERATION_TYPES.LDLT:
            result = decomposeLDL(M);
            break;
        case OPERATION_TYPES.SPARSE_LDLT:
            result = M.LDLt();
            break;
        case OPERATION_TYPES.RREF:
            result = findRREF(M);
            break;
        case OPERATION_TYPES.NULLSPACE:
            result = findNullspace(M);
            break;
    }

    if (result === NO_DECOMP_RESULT) {
        resultMarkup = "Can't decompose! Try pivoting.";
    } else {
        // different presentation for each matrix type
        if (OPERATIONS_FOR_MATRIX_TYPES.DENSE.has(operationType)) {
            resultMarkup = generateResultMatricesMarkup(result);
        } else if (OPERATIONS_FOR_MATRIX_TYPES.SPARSE.has(operationType)) {
            resultMarkup = "<textarea id='sparse-input' cols='60' rows='12'>" +
                            result.toString() +
                           "</textarea>";
        }
    }

    $("#result").html(resultMarkup);
    $("#decomposition").show().scrollView();
}

/** Initialize the document. */
$(document).ready(function () {
    var dropZone;   // the matrix file drop zone, for drag and drop.

    $.fn.scrollView = scrollView;

    $("#choose-size").click(drawDenseMatrixInput);
    $("#input-sparse-matrix").click(drawSparseMatrixInput);
    $("#decompose").click(presentResult);
    $("#input-div").hide();
    $("#decomposition").hide();

    // Show the load from file div only if supported by browser
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        $("#load-from-file-div").hide();
    } else {
        dropZone = document.getElementById('whole-page');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    }
});