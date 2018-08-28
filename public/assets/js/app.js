$(document).ready(function () {
    $("#exampleModal2").attr({
        "data-keyboard": false,
        "data-backdrop": 'static'
    });
    $(document).on("click", "#showNote", function () {
        $.ajax({
            method: "GET",
            url: "/article/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {

            })
    });

    // Whenever someone clicks a p tag
    $(document).on("click", "#showNote", function () {
        var thisId = $(this).attr("data-id");
        var thisTitle = $(this).attr("data-title");
        $("#finalize").attr({
            "data-id": thisId,
            "data-title": thisTitle
        });



        $.ajax({
            method: "GET",
            url: "/article/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data.note);
                console.log(data.note.length);
                if (data.note) {


                    var divCard = $("<div class='card' id='commentCard' style='width: 18rem;'>");
                    var divList = $("<ul class='list-group list-group-flush'>");
                    $("#commentBody").append(divCard);
                    $("#commentCard").append(divList);

                    for (var i = 0; i < data.note.length; i++) {
                        var divListItem = $("<li class='list-group-item'>");
                        divList.append(divListItem);
                        divListItem.text(data.note[i]._id);
                        var delBtn = $("<button type='button' class='btn btn-primary delete'>");
                        divListItem.append(delBtn);
                        delBtn.attr({
                            "data-id": data.note[i]._id,
                            id: "delete" + [i]
                        }).text("Delete");
                    }
                    $(document).on("click", ".delete", function () {
                        $(this).parent().remove();
                    });
                }
            })
    });

    $(document).on("click", ".delete", function () {
      var thisNoteId = $(this).attr("data-id");
      $.ajax({
          method: "DELETE",
          url: "/delete/" + thisNoteId
      })
          // With that done, add the note information to the page
          .then(function (data) {
              console.log(data);
          })

   });
    $(document).on("click", ".refresh", function () {
        var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var todayDate = new Date();
    var todayDay = todayDate.getDate();
    var todayMonth = todayDate.getMonth();
    var todayYear = todayDate.getFullYear();

    var today = month[todayMonth] + "-" + todayDay + "-" + todayYear;

    console.log(today);
        $.ajax({
            method: "GET",
            url: "/new"
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log("done");
            })

    });
    $(document).on("click", "#closer", function () {
        $("#commentCard").remove();
    });


    $(document).on("click", "#saveNote", function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");
        var thisTitle = $(this).attr("data-title");
        $("#finalize").attr({
            "data-id": thisId,
            "data-title": thisTitle
        });

        $.ajax({
            method: "GET",
            url: "/article/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data);
                console.log(data.note.length);
                if (data.note) {

                    //var divRow =$("<div class='row'>");
                    var divCard = $("<div class='card' style='width: 18rem;'>");
                    var divList = $("<ul class='list-group list-group-flush'>");
                    var divListItem = $("<li class='list-group-item'>");
                    $("#commentBody").append(divCard);
                    divCard.append(divList);

                    for (var i = 0; i < data.note.length; i++) {
                        divList.append(divListItem);
                        divListItem.text(data.note[i].id);
                    }

                    // If there's a note in the article

                    // Place the title of the note in the title input
                    $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    $("#bodyinput").val(data.note.body);
                }
            });

    });



    $(document).on("click", "#finalize", function () {
        var thisId = $(this).attr("data-id");
        var thisTitle = $(this).attr("data-title");
        console.log(thisId);
        console.log(thisTitle);
        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/article/" + thisId,
            data: {
                // Value taken from title input
                title: thisTitle,
                // Value taken from note textarea
                body: $("#bodyInput").val(),
                user: $("#formGroupExampleInput2").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // Empty the notes section
                $("#formGroupExampleInput2").val("");
                $("#bodyInput").val("");

            });
    });

});