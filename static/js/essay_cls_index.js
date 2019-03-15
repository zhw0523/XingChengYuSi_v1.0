$(function () {
    //判断当前宽度是否为手机
    var w = $(window).width();
    if (w <= 768) {
        //手机界面//

        //加载分类文章
        load_cls_essay();

    } else {
        //电脑界面//

        //加载分类文章
        load_cls_essay();

        //加载网站统计//
        load_statistics_info();

        //加载文章分类//
        load_essay_class();

        //加载热文推荐
        load_hot_essay();
    }

    //分类文章
    function set_essay_li(essay) {
        var html = '<li>\
                        <h1 style="height: 24px;line-height: 24px;font-size: 18px;font-weight: bold;margin-top: 0;margin-bottom: 4px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"><a href="/essay/' + essay.essay_title + '" title="' + essay.essay_title + '">' + essay.essay_title + '</a></h1>\
                        <span id="essay_span" style="display: none">' + essay.essay_content + '</span>\
                        <p id="essay_summary" style="font-size: 14px;color: #8a8a8a;margin-bottom: 4px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;height: 24px;line-height: 24px"></p>\
                        <dl class="info">\
                            <dl><a href="/user_center/' + essay.essay_push_user + '"><img src="'+essay.essay_user_headimg_url+'" alt="" class="usr_img"></a></dl>\
                            <dd><a class="user_name_link" href="/user_center/' + essay.essay_push_user + '">' + essay.essay_push_user + '</a></dd><div class="interval"></div>\
                            <dd><a href="/essay_cls/'+essay.essay_cls+'" class="essay_cls_link">'+ essay.essay_cls +'</a></dd><div class="interval"></div>\
                            <dd>' + essay.essay_push_time + '</dd>\
                            <dd style="float: right"><a class="essay_scan_link" href="/essay/' + essay.essay_title + '"><span style="color: #8a8a8a;margin-right: 5px;">阅读数</span><span>' + essay.essay_scan + '</span></a></dd>\
                        </dl>\
                    </li>';
        return html;
    }

    //加载分类文章
    function load_cls_essay() {
        var cls_name = $("#cls_name").val();
        $.ajax({
            url: "/load_cls_essay",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"cls_name": cls_name}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.essay_cls_list == "null") {
                    $('.cls_info').html("该分类暂无文章");
                    $('.cls_info').css({"background-color": "#fff", "padding-left": "10px"});
                } else {
                    var html = '';
                    for (var i = 0; i < data.essay_cls_list.length; i++) {
                        html += set_essay_li(data.essay_cls_list[i]);
                    }
                    $('.cls_info').html(html);
                }

                //删除字符串中的HTML标签
                function del_html_tag(str) {
                    return str.replace(/<[^>]+>/g, '')
                }

                //首页文章列表，样式
                $('.cls_info li').each(function () {
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
})