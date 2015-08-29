/** Specifies the number of digits to show after the dot. Does not affect computation precision. */
var DIGITS_AFTER_DOT = 3;

$(document).ready(function () {
    $("#choose-size").click(drawMatrixInput);
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

function handleFileSelect(event) {
    $("#matrix-data").html('');
    event.stopPropagation();
    event.preventDefault();

    var files = event.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
            '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

/**
 * Draws the input table for the input matrix.
 */
function drawMatrixInput() {
    var size = $("#matrix-size").val();
    var tableMarkup = "";
    for (var row = 0; row < size; row++) {
        tableMarkup += "<tr>";
        for (var col = 0; col < size; col++) {
            tableMarkup += '<td> <input id="' + row + '-' + col + '" ' +
                'type="text" value="0"> </td>';
        }
        tableMarkup += "</tr>";
    }
    $("#matrix-data").html(tableMarkup);
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