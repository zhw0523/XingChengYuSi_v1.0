$(function () {
    var w = $(window).width();
    if (w <= 768) {
        $('.col-xs-3').removeClass('col-xs-3').addClass('col-xs-12');
    }

    //更换头像
    $('#replace_avatar').click(function () {
        $('#choose_avatar').click();

        function check_img() {
            var file = $('#choose_avatar').val();
            var index1 = file.lastIndexOf(".");
            var index2 = file.length;
            var suffix = file.substring(index1 + 1, index2);//后缀名
            if (file) {
                if (suffix == 'jpg' || suffix == 'png') {
                    return true;
                } else {
                    alert('请选择图片作为头像');
                    return false;
                }
            } else {
                return true;
            }

        }

        $('#choose_avatar').on('change', function () {
            if (check_img() == true) {
                $('#sub_avatar').click();
            }
        })
    });

    //点击关注
    $('.guanzhu').click(function () {
        var user_name = $("#user_name").val();
        var name = $('#name').val();
        $.ajax({
            url: "/guanzhu",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"gz_name": user_name, "name": name}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.msg == 'ok') {
                    window.location.reload();
                } else if (data.msg == 'err') {
                    window.location = '/user_login';
                }
            },
            error: function () {
                alert('关注失败')
            }
        });
    });
    //点击取消关注
    $('.qx_guanzhu').click(function () {
        var user_name = $("#user_name").val();
        var name = $('#name').val();
        $.ajax({
            url: "/qx_guanzhu",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"qxgz_name": user_name, "name": name}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.msg == 'ok') {
                    window.location.reload();
                }
            },
            error: function () {
                alert('取消关注失败')
            }
        });
    });

    //点击更改签名
    $('.change_gq').click(function () {
        $('.gx_').fadeToggle();
        $('.gx_text').focus();
    });

    //提交更改个签
    $('.gx_btn').click(function () {
        var gx_text = $('.gx_text').val();

        function check_gq_text() {
            if (gx_text == "") {
                $('.gq_prompt').text('简介不能为空').show();
                return false;
            } else if (gx_text.length > 512) {
                $('.gq_prompt').text('不能超过512个字符').show();
                return false;
            } else {
                return true;
            }
        }

        if (check_gq_text() == true) {
            var uname = $('#name').val();
            $.ajax({
                url: "/change_gq",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"uname": uname, "gx_text": gx_text}),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.msg == 'ok') {
                        window.location.reload();
                    }
                },
                error: function () {
                    alert('更改失败')
                }
            });
        }
    });

    //用户文章
    function set_essay_li(essay) {
        var html = '<li>\
                        <h1 style="margin: 0;font-weight: bold;font-size: 18px;padding: 0;"><a href="/essay/' + essay.essay_title + '" title="' + essay.essay_title + '">' + essay.essay_title + '</a></h1>\
                        <span id="essay_span" style="display: none">' + essay.essay_content + '</span>\
                        <p id="essay_summary" style="font-size: 14px;margin-top: 10px;"></p>\
                        <p class="info">\
                            <span class="glyphicon glyphicon-user"></span><span>' + essay.essay_push_user + '</span>\
                            <span class="glyphicon glyphicon-time"\
                                  style="padding-left: 12px"></span><span>' + essay.essay_push_time + '</span>\
                            <span class="glyphicon glyphicon-paperclip" style="padding-left: 12px"></span><a href="/essay_cls/' + essay.essay_cls + '" style="color:#333">' + essay.essay_cls + '</a>\
                            <span class="glyphicon glyphicon-eye-open"\
                                  style="padding-left: 12px"></span><span>阅读(' + essay.essay_scan + ')</span>\
                        </p>\
                    </li>';
        return html;
    }

    //加载用户文章
    function load_user_essay() {
        var user_name = $("#user_name").val();
        $.ajax({
            url: "/load_user_essay",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"user_name": user_name}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.essay_user_list == "null") {
                    $('.user_center_essay').html("<span class='no_essay'>该用户暂无文章</span>");
                    $('.user_center_essay').css({"background-color": "#fff", "padding-left": "10px"});
                } else {
                    var html = '';
                    for (var i = 0; i < data.essay_user_list.length; i++) {
                        html += set_essay_li(data.essay_user_list[i]);
                    }
                    $('.user_center_essay').html(html);
                }

                //删除字符串中的HTML标签
                function del_html_tag(str) {
                    return str.replace(/<[^>]+>/g, '')
                }

                //首页文章列表，样式
                $('.user_center_essay li').each(function () {
                    $(this).children('#essay_summary').text(del_html_tag($(this).children('#essay_span').text().substr(0, 64) + "..."))
                    $(this).mouseover(function () {
                        $(this).css("background-color", "#f5f6f7")
                    }).mouseout(function () {
                        $(this).css("background-color", "#fff")
                    });
                    $(this).click(function () {
                        var essay_url = $(this).children('h1').children('a').prop('href');
                        window.location = essay_url;
                    })
                })

            },
            error: function () {
                alert('加载分类文章失败')
            }
        });
    }

    load_user_essay();
})