$(function () {
    $('#get_user_info').click(function () {
        $('.info').hide();
        get_user();
        $('.user_info').fadeIn()
    });
    $('#get_essay_info').click(function () {
        $('.info').hide();
        get_essay();
        $('.essay_info').fadeIn()

    });
    $('#get_cls_info').click(function () {
        $('.info').hide();
        get_cls();
        $('.cls_info').fadeIn()
    });

    //加载用户信息
    function set_user(user) {
        var html = '<tr>\
                                <td>' + user.id + '</td>\
                                <td>' + user.user_name + '</td>\
                                <td>' + user.register_time + '</td>\
                                <td><button style="background-color: #fff;border: #777 solid 1px">注销用户</button><span class="hint"></span></td>\
                            </tr>';
        return html;
    }

    function get_user() {
        //获取用户信息
        $.ajax({
            url: "/get_userinfo",
            type: "POST",
            dataType: "json",
            data: '',
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                for (var i = 0; i < data.userinfo_list.length; i++) {
                    html += set_user(data.userinfo_list[i]);

                }
                $('.user_info tbody').html(html);
                //注销用户按钮
                $('.user_info button').each(function () {
                    $(this).mouseover(function () {
                        $(this).css("color", "red")
                    });
                    $(this).mouseout(function () {
                        $(this).css("color", "#45B6F7")
                    });
                    //点击注销用户
                    $(this).click(function () {
                        var user_name = $(this).parent().prev().prev().text();
                        //alert(user_name)
                        //return false
                        var This = $(this);
                        $.ajax({
                            url: "/remove_user",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify({"user_name": user_name}),
                            contentType: 'application/json; charset=UTF-8',
                            success: function (data) {
                                if (data.msg == "ok") {
                                    This.next().text('注销成功');
                                    setTimeout(function () {
                                        This.next().hide();
                                        get_user();
                                    }, 1000)
                                }
                            },
                            error: function () {
                                $(".user_info .hint").text('注销失败');
                                setTimeout(function () {
                                    This.next().hide();
                                }, 1000)
                            }
                        })
                    })
                });
            },
            error: function () {
                alert("获取用户信息失败");
            }
        });
    }

    //加载文章信息
    function set_essay(essay) {
        var html = '<tr>\
                                <td>' + essay.essay_id + '</td>\
                                <td>' + essay.essay_title + '</td>\
                                <td>' + essay.essay_cls + '</td>\
                                <td>' + essay.essay_push_user + '</td>\
                                <td>' + essay.essay_push_time + '</td>\
                                <td><a href="javascript:void(0)" id="essay_comments" style="color:#45B6F7">' + essay.essay_comments_len + '</a></td>\
                                <td>' + essay.essay_scan + '</td>\
                                <td style="text-align: center"><span class="glyphicon glyphicon-trash rm_essay_span" style="color:#45B6F7"></span><span></span></td>\
                            </tr>';
        return html;
    }

    function get_essay() {
        //获取文章
        $.ajax({
            url: "/load_index_essay",
            type: "POST",
            dataType: "json",
            data: '',
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                for (var i = 0; i < data.essay_list.length; i++) {
                    html += set_essay(data.essay_list[i]);
                }
                $('.essay_info tbody').html(html);
                //遍历删除图标
                $('.essay_info .rm_essay_span').each(function () {
                    $(this).mouseover(function () {
                        $(this).css("color", "red")
                    });
                    $(this).mouseout(function () {
                        $(this).css("color", "#45B6F7")
                    });
                    //点击查看评论
                    $(this).parent().prev().prev().children('#essay_comments').click(function () {
                        if ($(this).text() == 0) {
                            return false
                        } else {
                            var comments_title = $(this).parent().prev().prev().prev().prev().text();
                            load_comments(comments_title);
                        }
                    });
                    //点击删除文章
                    $(this).click(function () {
                        var essay_name = $(this).parent().prev().prev().prev().prev().prev().prev().text();
                        //alert(essay_name)
                        //return false
                        var This = $(this);
                        $.ajax({
                            url: "/remove_essay",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify({"essay_name": essay_name}),
                            contentType: 'application/json; charset=UTF-8',
                            success: function (data) {
                                if (data.msg == "ok") {
                                    This.next().text('删除成功');
                                    setTimeout(function () {
                                        This.next().hide();
                                        get_essay();
                                    }, 1000)
                                }
                            },
                            error: function () {
                                This.next().text('删除失败');
                                setTimeout(function () {
                                    This.next().hide();
                                }, 1000)
                            }
                        })
                    })
                });
            },
            error: function () {
                alert("获取分类信息失败");
            }
        });
    }

    //评论信息
    function set_comments(comments) {
        var html = '<tr>\
                            <td>' + comments.comments_id + '</td>\
                            <td>' + comments.comment_user + '</td>\
                            <td>' + comments.comment_essay + '</td>\
                            <td>' + comments.comment_text + '</td>\
                            <td>' + comments.comment_time + '</td>\
                            <td>' + comments.comment_like + '</td>\
                            <td><a href="javascript:void(0);" id="del_comments" style="color:#777;">删除评论&nbsp;</a><span style="color:green"></span></td>\
                        </tr>';
        return html;
    }

    function load_comments(essay_title) {
        $.ajax({
            url: "/load_comments",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"essay_title": essay_title}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                for (var i = 0; i < data.essay_comments_list.length; i++) {
                    html += set_comments(data.essay_comments_list[i])
                }
                $('.comments_info tbody').html(html);
                $('.comments_info').show();
                $('.comments_info #del_comments').each(function () {
                    $(this).mouseover(function () {
                        $(this).css("color", "red")
                    });
                    $(this).mouseout(function () {
                        $(this).css("color", "#777")
                    });
                    //点击删除评论
                    $(this).click(function () {
                        var This = $(this);
                        var comments_id = $(this).parent().prev().prev().prev().prev().prev().prev().text()
                        //如果评论只剩最后一个删除后刷新文章信息，隐藏评论信息
                        if (data.essay_comments_list.length == 1) {
                            $.ajax({
                                url: "/remove_comments",
                                type: "POST",
                                dataType: "json",
                                data: JSON.stringify({"comments_id": comments_id}),
                                contentType: 'application/json; charset=UTF-8',
                                success: function (data) {
                                    if (data.msg == 'ok') {
                                        This.next().text('删除成功');
                                        setTimeout(function () {
                                            This.next().hide();
                                            get_essay();
                                            $('.comments_info').hide()
                                        }, 1000)
                                    } else {
                                        This.next().text('删除失败')
                                    }
                                },
                                error: function () {
                                    alert('删除评论失败')
                                }
                            })
                        } else {
                            $.ajax({
                                url: "/remove_comments",
                                type: "POST",
                                dataType: "json",
                                data: JSON.stringify({"comments_id": comments_id}),
                                contentType: 'application/json; charset=UTF-8',
                                success: function (data) {
                                    if (data.msg == 'ok') {
                                        This.next().text('删除成功');
                                        setTimeout(function () {
                                            This.next().hide();
                                            load_comments(essay_title);
                                        }, 1000)
                                    } else {
                                        This.next().text('删除失败')
                                    }
                                },
                                error: function () {
                                    alert('删除评论失败')
                                }
                            })
                        }
                    })
                })
            },
            error: function () {
                alert('评论加载失败')
            }
        })
    }


    //加载分类信息
    function set_cls(cls) {
        var html = '<tr>\
                            <td id="cls_id">' + cls.essay_class_id + '</td>\
                            <td>' + cls.essay_class_name + '</td>\
                            <td style="text-align: center"><span class="glyphicon glyphicon-trash rm_cls_span" style="color:#45B6F7"></span><span></span></td>\
                        </tr>';
        return html;
    }

    function get_cls() {
        //获取cls
        $.ajax({
            url: "/get_essay_class",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"cls_text": cls_text}),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                var html = '';
                for (var i = 0; i < data.essay_class_list.length; i++) {
                    html += set_cls(data.essay_class_list[i]);

                }
                $('.cls_info tbody').html(html);
                //遍历删除图标
                $('tbody .rm_cls_span').each(function () {
                    $(this).mouseover(function () {
                        $(this).css("color", "red")
                    });
                    $(this).mouseout(function () {
                        $(this).css("color", "#45B6F7")
                    });
                    //点击删除分类
                    $(this).click(function () {
                        var cls_name = $(this).parent().prev().text();
                        var This = $(this);
                        $.ajax({
                            url: "/remove_cls",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify({"cls_name": cls_name}),
                            contentType: 'application/json; charset=UTF-8',
                            success: function (data) {
                                if (data.msg == "ok") {
                                    This.next().text('删除成功');
                                    setTimeout(function () {
                                        This.next().hide();
                                        get_cls();
                                    }, 1000)
                                }
                            },
                            error: function () {
                                This.next().text('删除失败');
                                setTimeout(function () {
                                    This.next().hide();
                                }, 1000)
                            }
                        })
                    })
                });
            },
            error: function () {
                alert("获取分类信息失败");
            }
        });
    }

    //添加分类操作
    $('#sub_cls').click(function () {
        var cls_text = $('#cls_text').val();
        var This = $(this);
        if (cls_text == "") {
            //This.next().text("添加分类不能为空");
            $('#cls_text').focus();
            setTimeout(function () {
                This.next().hide();
            }, 1000)
        } else {
            $.ajax({
                url: "/add_essay_cls",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"cls_text": cls_text}),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.msg == "ok") {
                        $('#cls_text').val('');
                        This.next().text("添加分类成功");
                        setTimeout(function () {
                            This.next().hide();
                            get_cls();
                        }, 1000)
                    } else if (data.msg == "分类已存在") {
                        This.next().text("分类已存在");
                        setTimeout(function () {
                            This.next().hide();
                        }, 1000)
                    } else {
                        This.next().text("分类添加失败");
                        setTimeout(function () {
                            This.next().hide();
                        }, 1000)
                    }

                },
                error: function () {
                    alert("分类添加失败")
                }
            })
        }
    })
})