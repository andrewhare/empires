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

$(function() {
    var listInterval = 0;

    resetUI();

    $("#show-character").click(function() {
        if ($("#character").hasClass("key")) {
            $("#character").removeClass("key");
            $("#show-character").attr("value", "Hide Character");
        } else {
            $("#character").addClass("key");
            $("#show-character").attr("value", "Show Character");
        }
    });
    
    $("#save-real-name").click(function() {
        $("input, select, textarea").attr("autocomplete", "off");
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
                $("#refresh-list").click();
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


    $("#refresh-list").click(function() {
        $.ajax({url: "/characters"})
        .done(function(list) {
            console.log(list)
            $('#characters').empty();
            for (var i = 0; i < list.length; i++) {
                $("<tr><td>" + list[i] + "</td></tr>").appendTo('#characters');
            }
        });
    });

    $("#new-game").click(function() {
        $('#characters').empty();
        $.ajax({url: "/reset"})
        .done(function() {
            window.location.href = "#";
        });
    });

    $("#logout").click(function(e) {
        localStorage.removeItem("real-name");
        localStorage.removeItem("admin");
        setTimeout(resetUI, 500);
    })
});