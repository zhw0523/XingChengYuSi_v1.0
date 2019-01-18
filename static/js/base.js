$(function () {

    //响应网页
    var w = $(window).width();
    if (w <= 768) {
        $('.col-xs-9').removeClass('col-xs-9').addClass('col-xs-12');
    }

    var url = window.location.href;
    var url_s = url.split('/');
    $('#navbar ul li a').each(function () {
        if ($(this).attr('href') == '/' + url_s[3]) {
            $('title').text($(this).text() + '-行成于思');
            $(this).css({'border-bottom': '#1fa6e6 solid 3px'})
        }
    });

    //点击进入搜索按钮
    $('.search_btn_b').click(function () {
        window.location = '/search_index'
    });
    //侧滑菜单
    $('#menu').bind('click', function () {
        $('#cehua').css({'right': '-240px', 'width': "70%"}).show().animate({'right': "0"}, 240);
        $('.m-mark').css('display', 'block');
        $('.m-mark').click(function () {
            $('#cehua').css({'right': '0'}).hide().animate({'right': "-240px"}, 240);
            $('.m-mark').css('display', 'none');
        })
    });

    $('#navbar ul li').each(function () {
        $(this).mouseover(function () {
            $(this).css({"background-color": "#1fa6e6"});
            $(this).children('a').css("color", "#fff")
        }).mouseout(function () {
            $(this).css({"background-color": "#fff"});
            $(this).children('a').css("color", "#777")
        })
    });
    $(window).scroll(function () {

        if ($(document).scrollTop() <= 500) {
            //滚动条已经到达顶部为500
            $(".go_top").fadeOut(500)
        } else {
            $(".go_top").fadeIn(500)
        }
    });

    $(".go_top a").click(function () {
        //$('body,html').animate({scrollTop: 0}, 500); //动态模拟滑动返回顶部
        $('body,html').scrollTop(0) //直接返回顶部
        //return false;
    });

})