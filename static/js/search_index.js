$(function () {

    function set_search_ret(ret) {
        var html = '<li>\
                        <h1 style="margin: 0;font-weight: bold;font-size: 18px;padding: 0;border-left: 5px solid #1fa6e6"><a href="/essay/' + ret.essay_title + '" title="' + ret.essay_title + '">' + ret.essay_title + '</a></h1>\
                        <p id="essay_summary" style="font-size: 14px;margin-top: 10px;">' + ret.essay_content + '</p>\
                        <p class="info">\
                            <span class="glyphicon glyphicon-user"></span><span>' + ret.essay_push_user + '</span>\
                            <span class="glyphicon glyphicon-time"\
                                  style="padding-left: 12px"></span><span>' + ret.essay_push_time + '</span>\
                            <span class="glyphicon glyphicon-paperclip" style="padding-left: 12px"></span><a href="/essay_cls/' + ret.essay_cls + '" style="color:#333">' + ret.essay_cls + '</a>\
                            <span class="glyphicon glyphicon-eye-open"\
                                  style="padding-left: 12px"></span><span>阅读(' + ret.essay_scan + ')</span>\
                        </p>\
                    </li>';
        return html;
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
                        $('.search_index').html("抱歉, 什么都没有搜到..");
                        $('.search_index').css("background-color", "#f5f6f7")
                    } else {
                        var html = "";
                        for (var i = 0; i < data.search_result_list.length; i++) {
                            html += set_search_ret(data.search_result_list[i])
                        }
                        $('.search_index').html(html);


                        $('.search_index li').each(function () {
                            $(this).mouseover(function () {
                                $(this).css("background-color", "#f5f6f7")
                            }).mouseout(function () {
                                $(this).css("background-color", "#fff")
                            });
                            $(this).click(function () {
                                var essay_url = $(this).children('h1').children('a').prop('href');
                                //window.location = essay_url;
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