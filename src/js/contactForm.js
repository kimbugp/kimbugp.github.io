(function ($) {
    "use strict"; // Start of use strict
    $("form.contactForm").submit(function () {
        var f = $(this).find(".form-group"),
            ferror = false,
            emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;
        var data = {
            name: "",
            email: "",
            subject: "",
            message: ""
        };
        f.children("input").each(function () {
            var i = $(this);
            var rule = i.attr("data-rule");
            if (rule !== undefined) {
                var ierror = false;
                var pos = rule.indexOf(":", 0);
                if (pos >= 0) {
                    var exp = rule.substr(pos + 1, rule.length);
                    rule = rule.substr(0, pos)
                } else {
                    rule = rule.substr(pos + 1, rule.length)
                }
                switch (rule) {
                    case "required":
                        if (i.val() === "") {
                            ferror = ierror = true
                        }
                        break;
                    case "minlen":
                        if (i.val().length < parseInt(exp)) {
                            ferror = ierror = true
                        }
                        break;
                    case "email":
                        if (!emailExp.test(i.val())) {
                            ferror = ierror = true
                        }
                        break;
                    case "checked":
                        if (!i.is(":checked")) {
                            ferror = ierror = true
                        }
                        break;
                    case "regexp":
                        exp = new RegExp(exp);
                        if (!exp.test(i.val())) {
                            ferror = ierror = true
                        }
                        break
                }
                i.next(".validation").html(ierror ? i.attr("data-msg") !== undefined ? i.attr("data-msg") : "wrong Input" : "").show("blind")
            }
        });
        f.children("textarea").each(function () {
            var i = $(this);
            var rule = i.attr("data-rule");
            if (rule !== undefined) {
                var ierror = false;
                var pos = rule.indexOf(":", 0);
                if (pos >= 0) {
                    var exp = rule.substr(pos + 1, rule.length);
                    rule = rule.substr(0, pos)
                } else {
                    rule = rule.substr(pos + 1, rule.length)
                }
                switch (rule) {
                    case "required":
                        if (i.val() === "") {
                            ferror = ierror = true
                        }
                        break;
                    case "minlen":
                        if (i.val().length < parseInt(exp)) {
                            ferror = ierror = true
                        }
                        break
                }
                i.next(".validation").html(ierror ? i.attr("data-msg") != undefined ? i.attr("data-msg") : "wrong Input" : "").show("blind")
            }
        });
        if (ferror) return false;
        else var str = $(this).serialize();
        var action = $(this).attr("action");
        if (!action) {
            action = "contactform.php"
        }
        f.children("input").each(function () {
            var i = $(this);
            data[i.attr("name")] = i.val()
        });
        data.message = f.children("textarea").val();
        Email.send({
            Host: "smtp.gmail.com",
            Username: "kimbugwesmtp@gmail.com",
            Password: "thizsaitrtibhtkd",
            To: "kimbsimon2@gmail.com",
            From: data.email,
            Subject: data.subject,
            Body: `From: ${data.name} <br />${data.message}`
        }).then(msg => {
            if (msg == "OK") {
                $("#sendmessage").addClass("show");
                $("#errormessage").removeClass("show");
                $(".contactForm").find("input, textarea").val("")
            } else {
                $("#sendmessage").removeClass("show");
                $("#errormessage").addClass("show");
                $("#errormessage").html(msg)
            }
        });
        return false
    })
})(jQuery);