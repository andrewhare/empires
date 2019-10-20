function resetUI() {
    realName = localStorage.getItem("real-name");
    if (realName != null) {
        $("#real-name-fields").hide();
        $("#real-name-display").show();
        $("#real-name-display").show();
        $("#display-name").text(realName);
    } else {
        $("#real-name-fields").show();
        $("#real-name-display").hide();
        $("#real-name-display").hide();
        $("#real-name").val("");
    }
}

function unfreeze() {
    return setInterval(function() {
        $.ajax({url: "/characters"})
            .done(function(list) {
                $('#characters').empty();
                for (var i = 0; i < list.length; i++) {
                    $("<tr><td>" + list[i] + "</td></tr>").appendTo('#characters');
                }
            });
    }, 1000);
}

$(function() {
    var listInterval = 0;

    resetUI();
    
    $("#save-real-name").click(function() {
        var realName = $("#real-name").val()
        if (!realName) {
            realName = localStorage.getItem("real-name");
        }
        var char = $("#character").val();
        $.ajax({
            type: "POST",
            url: "/users",
            data: {name: realName, character: char}
        }).done(function() {
            localStorage.setItem("real-name", realName);
            if ($("#admin").prop("checked")) {
                localStorage.setItem("admin", "√");
            }
            if (localStorage.getItem("admin") ==  "√") {
                listInterval = unfreeze();
                window.location.href = "#list";
            } else {
                window.location.href = "#";
            }
            setTimeout(function() {
                resetUI();
                $("#character").val("");
            }, 500);
        });
    });

    $("#freeze").click(function() {
        clearInterval(listInterval);
        $(this).hide();
        $("#unfreeze").show();
    });

    $("#unfreeze").click(function() {
        listInterval = unfreeze();
        $(this).hide();
        $("#freeze").show();
    });

    $("#start-over").click(function() {
        clearInterval(listInterval);
        $("#unfreeze").hide();
        $("#freeze").show();
        window.location.href = "#";
    });

    $("#logout").click(function(e) {
        localStorage.removeItem("real-name");
        localStorage.removeItem("admin");
        setTimeout(resetUI, 500);
    })
});