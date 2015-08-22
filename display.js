$(document).ready(function () {
    $("#choose-size").click(drawMatrixInput);
    $("#decompose").click(presentDecomposition);
    $("#P-div").hide();
    $("#decomposition").hide();
});

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

function presentDecomposition() {
    var shouldLPU = $("#lpu-decomp").prop("checked");
    var size = parseInt($("#matrix-size").val());
    var result = decompose(readMatrix(), shouldLPU);
    var markup = "";

    if (shouldLPU) {
        $("#P-div").show();
        for (var row = 0; row < size; row++) {
            markup += "<tr>";
            for (var col = 0; col < size; col++) {
                markup += '<td>' + result[P_CELL][row][col] + '</td>';
            }
            markup += "</tr>";
        }
        $("#P-matrix").html(markup);
    }
    else {
        $("#P-div").hide();
    }

    markup = "";
    for (var step = 1; step < result[LOG_L_CELL].length; step++) {
        markup += "<div><h3 class='clear'>Step " + step + "</h3>";
        markup += "<div class='left'><h4>L Matrix</h4><table>";
        for (var row = 0; row < size; row++) {
            markup += "<tr>";
            for (var col = 0; col < size; col++) {
                markup += '<td>' + result[LOG_L_CELL][step][row][col] + '</td>';
            }
            markup += "</tr>";
        }
        markup += "</table></div>";
        markup += "<div class='right'><h4>U Matrix</h4><table>";
        for (var row = 0; row < size; row++) {
            markup += "<tr>";
            for (var col = 0; col < size; col++) {
                markup += '<td>' + result[LOG_U_CELL][step][row][col] + '</td>';
            }
            markup += "</tr>";
        }
        markup += "</table></div></div><br>";
    }

    $("#step-by-step").html(markup);
    $("#decomposition").show();
}