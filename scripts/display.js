/** Specifies the number of digits to show after the dot. Does not affect
 * computation precision. */
var DIGITS_AFTER_DOT = 3;

/** Delimiters for the GNU Octave matrix format. */
var ROW_DELIM = ';';
var COL_DELIM = ',';

/** The cell of the start of the data in the GNU Octave matrix format. */
var DATA_START = 1;

/** The length of trailing unnecessary data cells in the GNU Octave matrix format. */
var DATA_TRAIL_LEN = 1;

/** Alignments of matrices on the screen */
var MATRIX_ALIGN = ['left', 'right'];

/** Max number of matrices in the same row */
var MAX_MATRIX_NUM = MATRIX_ALIGN.length;

/** The header of an extras matrix. */
var EXTRAS_MATRIX_HEADERR = 0;

/** The data of an extras matrix. */
var EXTRAS_MATRIX_DATA = 1;

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

$(document).ready(function () {
    $.fn.scrollView = scrollView;

    $("#choose-size").click(drawMatrixInput);
    $("#decompose").click(presentDecomposition);
    $("#matrix-data-div").hide();
    $("#decomposition").hide();

    // Show the load from file div only if supported by browser
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        $("#load-from-file-div").hide();
    } else {
        var dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    }
});


/**
 * Given the load event, format the file into a matrix based on the GNU Octave
 * specification: [col0, col1, ...; col0, col1, ...; ....]
 * Where ; is the row delimiter, and , is the column delimiter.
 * @param event Load event.
 */
function loadFile(event) {
    var matrix = event.target.result.substring(DATA_START,
        event.target.result.length - DATA_TRAIL_LEN).split(ROW_DELIM);
    
    // split each row into the proper columns
    for (var row = 0; row < matrix.length; row++) {
        matrix[row] = matrix[row].split(COL_DELIM);
    }

    drawMatrixInput(undefined, matrix)
}

/**
 * Handles dropping a file into the drop-zone.
 * @param event File dropping event.
 */
function handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();
    $("#matrix-data").html('');

    var file = event.dataTransfer.files[0]; // FileList object.
    var reader = new FileReader();

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
 * Draws the input table for the input matrix.
 * @param event Received if this is called by the event listener.
 * @param M A matrix with the default values to use for the input.
 */
function drawMatrixInput(event, M) {
    // Determine if the function was called by an event listener or by loadFile
    if (typeof(event) === 'undefined') {  // loadFile, need to set the matrix size
        $("#matrix-size").val(M.length);
    } else {  // event listener
        var size = parseInt($("#matrix-size").val());
        M = math.zeros(size, size);
        $("#list").html("Drop files here");
    }

    $("#matrix-data").html(matrixMarkup(M, true));
    $("#matrix-data-div").show();
}

/**
 * Reads the input matrix and returns it as an array.
 * @return {*} input matrix
 */
function readMatrix() {
    var size = parseInt($("#matrix-size").val());
    var M = math.zeros(size, size);
    for (var row = 0; row < size; row++) {
        for (var col = 0; col < size; col++) {
            M[row][col] = parseInt($("#" + row + "-" + col + "").val());
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
function matrixMarkup(M, input) {
    var markup = "";
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
    return markup;
}

/**
 * Prints the result matrices.
 * @param result Array containing the result matrices to print.
 * @return String The markup for the result matrices.
 */
function resultMatricesMarkup(result) {
    var stepByStepMarkup, extrasMarkup;
    var matrixNum;

    // generate the step by step markup
    stepByStepMarkup = "<div> <h3>Step by step:</h3> <br>";
    // shows each step of the decomposition process
    for (var step = 0; step < result[STEP_MATRICES_INDEX][FIRST_RESULT_MATRIX].length; step++) {
        stepByStepMarkup += "<div><h3 class='clear'>Step " + step + "</h3>";
        for (matrixNum = 0; matrixNum < result[STEP_MATRICES_INDEX].length; matrixNum++) {
            stepByStepMarkup += "<div class=" + MATRIX_ALIGN[matrixNum % MAX_MATRIX_NUM] + ">" +
                "<h4>Matrix #" + matrixNum + "</h4><table>" +
                matrixMarkup(result[STEP_MATRICES_INDEX][matrixNum][step], false) +
                "</table></div>";
        }
        stepByStepMarkup += "</div> <br>";
    }
    stepByStepMarkup += "</div>";

    // generate the extras matrices markup (P, L, D matrices, etc')
    extrasMarkup = "<div>";
    for (matrixNum = STEP_MATRICES_INDEX + 1; matrixNum < result.length; matrixNum++) {
        extrasMarkup += "<h3>" + result[matrixNum][EXTRAS_MATRIX_HEADERR]  + ":</h3> <table>" +
                        matrixMarkup(result[matrixNum][EXTRAS_MATRIX_DATA], false)+ "</table>";
    }
    extrasMarkup += "</div> <br>";

    return extrasMarkup + stepByStepMarkup;
}

/**
 * Presents the decomposition.
 */
function presentDecomposition() {
    var M = readMatrix(),   // the input matrix
        markup,             // the markup for the result matrices
        result;             // will hold the result

    switch ($("#decomposition-type").val()) {
        case "PLU":
            result = decomposePLU(M);
            break;
        case "LU":
            result = decomposeLU(M);
            break;
        case "LDLt":
            result = decomposeLDL(M);
            break;
    }

    if (result === NO_DECOMP_RESULT) {
        markup = "Can't decompose! Try pivoting.";
    } else {
        markup = resultMatricesMarkup(result);
    }

    $("#result").html(markup);
    $("#decomposition").show().scrollView();
}