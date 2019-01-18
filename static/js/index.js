$(function () {

    //判断滚动条到底部加载
    var essay_numebr = 0;
    var essay_all_load = false;
    load_essay();
    $(window).scroll(function () {

        if ($(document).scrollTop() <= 0) {
            //滚动条已经到达顶部为0
        }

        if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
            //alert("滚动条已经到达底部为" + $(document).scrollTop());
            if (essay_all_load == false) {
                setTimeout(function () {
                    $(".spinner").show();
                    load_essay();
                    essay_numebr += 10
                }, 920);
            }


        }
    });

    //判断当前宽度是否为手机
    var windows_width = $(window).width();
    if (windows_width <= 768) {
        //如果是手机界面

    } else {
        //如果是电脑界面//

        //加载网站统计//
        load_statistics_info();

        //加载文章分类//
        load_essay_class();

        //加载热文推荐
        load_hot_essay();

    }

    //网站统计
    function set_statistics(info) {
        var html = '<li><span>用户总数&nbsp;</span><b>' + info.user + '</b></li>\
                    <li><span>文章总数&nbsp;</span><b>' + info.essay + '</b></li>\
                    <li><span>分类总数&nbsp;</span><b>' + info.essay_cls + '</b></li>\
                    <li><span>最后更新时间&nbsp;</span><b>' + info.end_time + '</b></li>';
        return html;
    }

    //加载网站统计
    function load_statistics_info() {
        $.ajax({
            url: "/get_statistics_info",
            type: "POST",
            dataType: "json",
            data: "",
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                html += set_statistics(data);
                $('.statistics ul').html(html)
            },
            error: function () {
                $('.statistics ul').hide()
            }
        });
    }

    //文章分类
    function set_essay_cls(cls) {
        var html = '<li><a href="/essay_cls/' + cls.essay_class_name + '" title="' + cls.essay_class_name + '">' + cls.essay_class_name + '&nbsp;(' + cls.essay_class_number + ')</a></li>';
        return html;
    }

    //加载文章分类
    function load_essay_class() {
        $.ajax({
            url: "/get_essay_class",
            type: "POST",
            dataType: "json",
            data: "",
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                for (var i = 0; i < data.essay_class_list.length; i++) {
                    var html = '';
                    html += set_essay_cls(data.essay_class_list[i]);
                    $('.essay_classification ul').append(html);
                }
            },
            error: function () {
                alert("首页文章分类加载失败")
            }
        });
    }

    //热文推荐
    function set_hot_essay(essay, i) {
        var html = '<li><a href="' + essay.essay_url + '" title="' + essay.essay_title + '">' + (i + 1) + '. ' + essay.essay_title + '</a></li>';
        return html;
    }

    //加载热文推荐
    function load_hot_essay() {
        $.ajax({
            url: "/load_hot_essay",
            type: "POST",
            dataType: "json",
            data: "",
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = "";
                for (var i = 0; i <= data.hot_essay_list.length; i++) {
                    html += set_hot_essay(data.hot_essay_list[i], i);
                    $('#hot_essay_ul').html(html);
                }
            },
            error: function () {
                alert("加载热文推荐失败")
            }
        });
    }

    //首页文章
    function set_essay_li(essay) {
        var html = '<li>\
                        <h1 style="margin: 0;font-weight: bold;font-size: 18px;padding: 0;border-left: 5px solid #1fa6e6"><a href="/essay/' + essay.essay_title + '" title="' + essay.essay_title + '">' + essay.essay_title + '</a></h1>\
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

    //加载首页文章
    function load_essay() {
        // load_essay
        $.ajax({
            url: "/load_index_essay",
            type: "POST",
            dataType: "json",
            data: "",
            success: function (data) {
                var html = "";
                if (data.essay_list.length < 6) {
                    $("#dixian").show();
                    $(".spinner").hide();
                    essay_all_load = true;
                }
                if (data.essay_list.length - essay_numebr >= 10) {
                    for (var i = essay_numebr; i <= essay_numebr + 9; i++) {
                        html += set_essay_li(data.essay_list[i]);
                    }
                } else {
                    if (essay_numebr >= data.essay_list.length) {
                        $("#dixian").show();
                        $(".spinner").hide();
                        essay_all_load = true;
                    }
                    //alert(essay_numebr)
                    //alert(data.essay_list.length)
                    for (var i = essay_numebr; i <= data.essay_list.length; i++) {
                        var e_html = "";
                        e_html += set_essay_li(data.essay_list[i]);
                        $(".index").append(e_html);

                        //删除字符串中的HTML标签
                        function del_html_tag(str) {
                            return str.replace(/<[^>]+>/g, '')
                        }

                        //首页文章列表，样式
                        $('.index li').each(function () {
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
                    }

                }


                $(".index").append(html);

                //删除字符串中的HTML标签
                function del_html_tag(str) {
                    return str.replace(/<[^>]+>/g, '')
                }

                //首页文章列表，样式
                $('.index li').each(function () {
                    $(this).children('#essay_summary').text(del_html_tag($(this).children('#essay_span').text().substr(0, 64) + "..."))
                    $(this).mouseover(function () {
                        $(this).css("background-color", "#f5f6f7")
                    }).mouseout(function () {
                        $(this).css("background-color", "#fff")
                    });
                    $(this).click(function () {
                        var essay_url = $(this).children('h1').children('a').prop('href');
                        // window.location = essay_url;
                    })
                })

            },
            error: function () {
                //alert('加载首页文章失败')
            }
        });
    }


})