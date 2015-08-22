$(document).ready(function () {
    $("#choose-size").click(drawMatrixInput);
    $("#decompose").click(presentDecomposition);
    $("#P-div").hide();
    $("#decomposition").hide();
});

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

function matrixMarkup(M) {
    var markup = "";
    for (var row = 0; row < M.length; row++) {
        markup += "<tr>";
        for (var col = 0; col < M.length; col++) {
            markup += '<td>' + M[row][col] + '</td>';
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