$(function () {
    //校验
    $('#check_').click(function () {
        check_login();
    });

    //校验登录
    function check_login() {
        var uname = $('#inputName').val();
        var upswd = $('#inputPassword').val();
        if (uname == "" || upswd == "") {
            $('.hint').text("用户名和密码不能为空");
        } else {
            $('.hint').hide();
            $.ajax({
                url: "/user_login_check",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"uname": uname, "upswd": upswd}),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.msg == "密码错误") {
                        $('.hint').text("密码错误,请重新输入").show();
                    } else {
                        window.location = data.msg;
                        return false;
                    }
                },
                error: function () {
                    //alert("校验失败")
                }
            })
        }
    }
})