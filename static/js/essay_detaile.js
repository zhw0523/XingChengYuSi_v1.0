$(function () {

    //加载文章上下页
    load_essay_next_prev();
    //加载相关推荐
    load_related();
    //加载评论
    load_comments();
    //加载文章
    $('.essay_info').html($('.essay_content').val());

    //加载代码高亮
    SyntaxHighlighter.all();
    var w = $(window).width();
    if (w <= 768) {
        //手机界面//
    } else {
        //电脑界面//

        //加载网站统计
        load_statistics_info();

        //加载热文
        load_hot_essay();

        //加载文章分类
        load_essay_class();
    }

    //文章详细
    function set_essay_detaile(essay) {
        var html = '';
        return html;
    }

    //加载文章详细
    function load_essay_detaile() {
        //获取文章名称
        var essay_title_path = window.location.pathname.split('/')[2];
        var essay_title = decodeURI(essay_title_path);
        $.ajax({
            url: "/load_essay_detaile",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                for (var i = 0; i < data.essay_detaile.length; i++) {
                    html += set_essay_detaile(data.essay_detaile[i])
                }
                $('.essay_detaile').html(html)

            },
            error: function () {
                alert('err')
            }
        })
    }


    //评论
    function set_comments_ul(comment) {
        var html = '<li>\
                            <div>\
                                <img src="' + comment.comment_user_head + '" alt="" width="35px" height="35px" style="border: #777 solid 1px;">\
                                <strong class="comment_user">' + comment.comment_user + '</strong>\
                            </div>\
                            <div style="padding-left: 39px;">\
                                <p class="comment_info">' + comment.comment_text + '</p>\
                                <div class="comment_bottom">\
                                    <time>' + comment.comment_time + '</time>\
                                    <span id="like_number">获赞(' + comment.comment_like + ')</span>\
                                    <a href="javascript:void(0)"><span\
                                            style="float: right;font-size: 18px;padding-left: 20px" id="like"\
                                            class="glyphicon glyphicon-thumbs-up"></span>\
                                            <input type="hidden" id="comments_id" value="' + comment.comments_id + '"></a>\
                                    <a href="javascript:void(0)" id="reply">回复Ta</a>\
                                    <input type="hidden" id="comments_user" value="' + comment.comment_user + '"></a>\
                                </div>\
                            </div>\
                            <div style="clear: both"></div>\
                        </li>';
        return html;
    }

    //加载评论
    function load_comments() {
        var essay_title_path = window.location.pathname.split('/')[2];
        var essay_title = decodeURI(essay_title_path);
        $.ajax({
            url: "/load_comments",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.essay_comments_list == 'null') {
                    $('.comments ul').css('padding', '0');
                    $('.comments ul').html('<span style="color:#777">暂无评论</span>');
                } else {
                    if (data.essay_comments_list.length > 2) {
                        var html = '';
                        for (var i = 0; i < 2; i++) {
                            html += set_comments_ul(data.essay_comments_list[i])
                        }
                        $('.comments ul').html(html);
                        $('.comments ul').append('<div id="d_more" style="text-align: center;padding-top: 10px"><a href="javascript:void(0)" class="btn" style="border: #777 solid 1px;color:#333" id="more">查看更多</a></div>')
                    } else {
                        var htm = '';
                        for (var i = 0; i < data.essay_comments_list.length; i++) {
                            htm += set_comments_ul(data.essay_comments_list[i])
                        }
                        $('.comments ul').html(htm);
                    }
                    $('.comments ul li .comment_bottom').each(function () {
                        $(this).children().children('#like').mouseover(function () {
                            $(this).css('color', '#45B6F7')
                        });
                        $(this).children().children('#like').mouseout(function () {
                            $(this).css('color', '#333')
                        });
                        $(this).children('#reply').click(function () {
                            //回复评论
                            var comments_user = $(this).next().val();
                            $('#comment_info').val('回复 @' + comments_user + ': ').focus()
                        });
                        //评论点赞
                        $(this).children().children('#like').click(function () {
                            var comments_id = $(this).next().val();
                            var This = $(this);
                            $.ajax({
                                url: "/reply_comments",
                                type: "POST",
                                dataType: "json",
                                data: JSON.stringify({"comments_id": comments_id}),
                                contentType: 'application/json; charset=UTF-8',
                                success: function (data) {
                                    if (data.msg == 'ok') {
                                        //点赞成功
                                        This.parent().prev().html('获赞(' + data.like_number + ')')
                                    } else {
                                        //alert(data.msg)
                                    }
                                },
                                error: function () {
                                    //alert('点赞失败')
                                }
                            })
                        })
                    })
                }
                $('#more').click(function () {
                    $('#d_more').hide();
                    for (var i = 2; i < data.essay_comments_list.length; i++) {
                        var html = '';
                        html += set_comments_ul(data.essay_comments_list[i]);
                        $('.comments ul').append(html)
                    }
                    $('.comments ul li .comment_bottom').each(function () {
                        $(this).children().children('#like').mouseover(function () {
                            $(this).css('color', '#45B6F7')
                        });
                        $(this).children().children('#like').mouseout(function () {
                            $(this).css('color', '#333')
                        });
                        $(this).children('#reply').click(function () {
                            //回复评论
                            var comments_user = $(this).next().val();
                            $('#comment_info').val('@' + comments_user + ': ').focus()
                        });
                        //评论点赞
                        $(this).children().children('#like').click(function () {
                            var comments_id = $(this).next().val();
                            var This = $(this);
                            $.ajax({
                                url: "/reply_comments",
                                type: "POST",
                                dataType: "json",
                                data: JSON.stringify({"comments_id": comments_id}),
                                contentType: 'application/json; charset=UTF-8',
                                success: function (data) {
                                    if (data.msg == 'ok') {
                                        //点赞成功
                                        This.parent().prev().html('获赞(' + data.like_number + ')')
                                    } else {
                                        //alert(data.msg)
                                    }
                                },
                                error: function () {
                                    // alert('点赞失败')
                                }
                            })
                        })
                    })
                });
            },
            error: function () {
                //alert('加载当前文章评论失败')
            }
        })
    }

    //点击按钮发布评论
    $('#comment_commit').click(function () {
        var comment_info = $('#comment_info').val();
        if (comment_info == '') {
            //alert('评论内容不能为空')
            $('#comment_info').focus();
        } else {
            var essay_title_path = window.location.pathname.split('/')[2];
            var essay_title = decodeURI(essay_title_path);
            submit_comments(essay_title, comment_info)

        }
    });

    //发布评论ajax
    function submit_comments(essay_title, comment_info) {
        $.ajax({
            url: "/submit_comments",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"comment_info": comment_info, "essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.msg == 'ok') {
                    //alert('发布成功');
                    $('#comment_info').val('');
                    load_comments();
                } else {
                    alert(data.msg);
                    window.location = '/user_login'
                }
            },
            error: function () {
                //alert('发布评论失败')
            }
        })
    }


    //相关文章推荐
    function set_related_li(essay) {
        var html = '<li><a href="/essay/' + essay + '">' + essay + '</a></li>';
        return html;
    }

    //加载相关推荐
    function load_related() {
        var essay_title_path = window.location.pathname.split('/')[2];
        var essay_title = decodeURI(essay_title_path);
        $.ajax({
            url: '/load_related_essay',
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.similarity_list == "null") {
                    $(".related ul").html("没有相似的推荐文章");
                    $(".related ul").css({"padding": 0, "color": "#777"})
                } else {
                    //alert(data.similarity_list);
                    var html = "";
                    for (var i = 0; i < data.similarity_list.length; i++) {
                        html += set_related_li(data.similarity_list[i]);
                        $(".related ul").html(html)
                    }
                }

            },
            error: function () {
                //alert("相关推荐加载失败")
            }
        });
    }

    //获取文章上一个下一个
    function load_essay_next_prev() {
        var essay_title_path = window.location.pathname.split('/')[2];
        var essay_title = decodeURI(essay_title_path);
        $.ajax({
            url: "/get_prev_or_next",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.essay_next == '') {
                    $('.next a').text("没有更多了");
                    $('.next a').attr("href", "javascript:void(0);")
                } else {
                    $('.next a').text(data.essay_next);
                    $('.next a').attr("href", "/essay/" + data.essay_next)
                }
                if (data.essay_prev == '') {
                    $('.prev a').text("没有更多了");
                    $('.prev a').attr("href", "javascript:void(0);")
                } else {
                    $('.prev a').text(data.essay_prev);
                    $('.prev a').attr("href", "/essay/" + data.essay_prev)
                }
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

    var essay_title_path = window.location.pathname.split('/')[2];
    var essay_title = decodeURI(essay_title_path);
    $('title').text(essay_title + "-行成于思")
})