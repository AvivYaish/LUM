/** Specifies the number of digits to show after the dot. Does not affect computation precision. */
var DIGITS_AFTER_DOT = 3;

/** Delimiters for the GNU Octave matrix format. */
var ROW_DELIM = ';';
var COL_DELIM = ',';

/** The cell of the start of the data in the GNU Octave matrix format. */
var DATA_START = 1;

/** The length of trailing unnecessary data cells in the GNU Octave matrix format. */
var DATA_TRAIL_LEN = 1;

$(document).ready(function () {
    $("#choose-size").click(function(event) {
        drawMatrixInput();
    });
    $("#decompose").click(presentDecomposition);
    $("#P-div").hide();
    $("#decomposition").hide();
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        $("#load-from-file-div").hide();
    } else {
        var dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    }
});

/**
 * Given the load event, format the file into a matrix based on the GNU Octave specification:
 * [col0, col1, ...; col0, col1, ...; ....]
 * Where ; is the row delimiter, and , is the column delimiter.
 * @param event Load event.
 */
function loadFile(event) {
    var matrix = event.target.result.substring(DATA_START, event.target.result.length - DATA_TRAIL_LEN).split(ROW_DELIM);

    // split each row into the proper columns
    for (var row = 0; row < matrix.length; row++) {
        matrix[row] = matrix[row].split(COL_DELIM);
    }

    drawMatrixInput(matrix)
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

    $("#list").html('<ul>File selected: <br><li><strong>' + escape(file.name) + '</li></ul>');
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
    event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

/**
 * Draws the input table for the input matrix.
 * @param M A matrix with the default values to use for the input.
 */
function drawMatrixInput(M) {
    var size;
    var tableMarkup = "";
    if (typeof(M) === 'undefined') {
        size = parseInt($("#matrix-size").val());
        M = math.zeros(size, size);
    } else {
        size = M.length;
        $("#matrix-size").val(size);
    }

    for (var row = 0; row < size; row++) {
        tableMarkup += "<tr>";
        for (var col = 0; col < size; col++) {
            tableMarkup += '<td> <input id="' + row + '-' + col + '" ' +
                'type="text" value="' + M[row][col] + '"> </td>';
        }
        tableMarkup += "</tr>";
    }
    $("#matrix-data").html(tableMarkup);
    $("#list").html("Drop files here");
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
 * @param n A number.
 * @return {boolean} true if n is an int, false otherwise.
 */
function isInt(n) {
    return n % 1 === 0;
}

/**
 * Given a matrix M, generate table markup for it's data.
 * @param M
 * @return {string}
 */
function matrixMarkup(M) {
    var markup = "";
    for (var row = 0; row < M.length; row++) {
        markup += "<tr>";
        for (var col = 0; col < M.length; col++) {
            if (isInt(M[row][col])) {
                markup += '<td>' + M[row][col] + '</td>';
            } else {
                markup += '<td>' + parseFloat(M[row][col].toFixed(DIGITS_AFTER_DOT)) + '</td>';
            }
        }
        markup += "</tr>";
    }
    return markup;
}

/**
 * Presents the decomposition.
 */
function presentDecomposition() {
    var shouldLPU = $("#lpu-decomp").prop("checked");
    var result = decompose(readMatrix(), shouldLPU);
    var markup = "";

    // if the checkbox is checked, shows the P matrix.
    if (shouldLPU) {
        $("#P-div").show();
        $("#P-matrix").html(matrixMarkup(result[P_CELL]));
    }
    else {
        $("#P-div").hide();
    }

    // shows each step of the decomposition process
    for (var step = 1; step < result[LOG_L_CELL].length; step++) {
        markup += "<div><h3 class='clear'>Step " + step + "</h3>";
        markup += "<div class='left'><h4>L Matrix</h4><table>";
        markup += matrixMarkup(result[LOG_L_CELL][step]);
        markup += "</table></div>";
        markup += "<div class='right'><h4>U Matrix</h4><table>";
        markup += matrixMarkup(result[LOG_U_CELL][step]);
        markup += "</table></div></div><br>";
    }

    $("#step-by-step").html(markup);
    $("#decomposition").show();
}