$(function () {

    function set_search_ret(ret) {
        var html = '<li>\
                        <h1 style="height: 24px;line-height: 24px;font-size: 18px;font-weight: bold;margin-top: 0;margin-bottom: 4px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"><a href="/essay/' + ret.essay_title + '" title="' + ret.essay_title + '">' + ret.essay_title + '</a></h1>\
                        <span id="essay_span" style="display: none">' + ret.essay_content + '</span>\
                        <p id="essay_summary" style="font-size: 14px;color: #8a8a8a;margin-bottom: 4px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;height: 24px;line-height: 24px"></p>\
                        <dl class="info">\
                            <dl><a href="/user_center/' + ret.essay_push_user + '"><img src="' + ret.essay_user_headimg_url + '" alt="" class="usr_img"></a></dl>\
                            <dd><a class="user_name_link" href="/user_center/' + ret.essay_push_user + '">' + ret.essay_push_user + '</a></dd><div class="interval"></div>\
                            <dd><a href="/essay_cls/' + ret.essay_cls + '" class="essay_cls_link">' + ret.essay_cls + '</a></dd><div class="interval"></div>\
                            <dd>' + ret.essay_push_time + '</dd>\
                            <dd style="float: right"><a class="essay_scan_link" href="/essay/' + ret.essay_title + '"><span style="color: #8a8a8a;margin-right: 5px;">阅读数</span><span>' + ret.essay_scan + '</span></a></dd>\
                        </dl>\
                    </li>';
        return html;
    }

    //删除字符串中的HTML标签
    function del_html_tag(str) {
        return str.replace(/<[^>]+>/g, '')
    }

    //搜索
    $('.search_btn').click(function () {
        var keyword = $(".search_input").val();
        if (keyword == "") {
            //点击搜索时获取焦点
            $(".search_input").focus();
            return false;
        } else {
            $.ajax({
                url: "/search",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"keyword": keyword}),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.msg == "null") {
                        $('.search_index').text("抱歉, 什么都没有搜到..");
                        $('.search_index').css("background-color", "#f5f6f7")
                    } else {
                        var html = "";
                        for (var i = 0; i < data.search_result_list.length; i++) {
                            html += set_search_ret(data.search_result_list[i])
                        }
                        $('.search_index').html(html);


                        $('.search_index li').each(function () {
                            $(this).children('#essay_summary').text(del_html_tag($(this).children('#essay_span').text().substr(0, 256)));

                            $(this).mouseover(function () {
                                $(this).css("background-color", "#f5f6f7")
                            }).mouseout(function () {
                                $(this).css("background-color", "#fff")
                            });
                        });
                        //搜索文章列表，样式
                        var search_keyword = $('.search_input').val();
                        var regExp = new RegExp(search_keyword, 'g');
                        //h1标题关键字标红
                        $('.search_index li h1 a').each(function () {
                            //关键字标红
                            var html = $(this).html();
                            var new_html = html.replace(regExp, '<span style="color: #c00">' + search_keyword + '</span>');
                            $(this).html(new_html)  //更新HTML显示关键字
                        });
                        // p标签关键字标红
                        $('.search_index li #essay_summary').each(function () {
                            //关键字标红
                            var html = $(this).html();
                            var new_html = html.replace(regExp, '<span style="color: #c00">' + search_keyword + '</span>');
                            $(this).html(new_html)  //更新HTML显示关键字
                        })
                    }

                },
                error: function () {
                    alert("搜索返回出错")
                }
            })
        }
    });


})