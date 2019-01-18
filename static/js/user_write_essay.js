$(function () {
    //实例ue编辑器
    var ue = UE.getEditor('content', {
        serverUrl: "/upload/", //上传路径
        initialFrameHeight: 280, //编辑器高度
        initialFrameWidth: "100%", //宽度
        focus: true, //是否一打开就获取焦点
        enableContextMenu: false,  //关闭右键
        wordCount: false, //关闭字数统计
        enableAutoSave: true, //关闭自动保存
        topOffset:50, //浮动50px
    });

    $('.essay_write').css({'border-bottom': '#1fa6e6 solid 3px'});

    //文章分类
    function set_opt(cls) {
        var html = '<option value="' + cls.essay_class_name + '">' + cls.essay_class_name + '</option>';
        return html;
    }

    //加载文章分类
    function load_essay_cls() {
        $.ajax({
            url: '/get_essay_class',
            type: "POST",
            dataType: "json",
            data: "",
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                for (var i = 0; i < data.essay_class_list.length; i++) {
                    var html = "";
                    html += set_opt(data.essay_class_list[i]);
                    $('#select').append(html)
                }

            },
            error: function () {
                alert("加载文章分类失败")
            }
        });
    }

    //加载分类
    load_essay_cls();

    //选择分类
    $('#select').change(function () {
        if ($(this).val() == "0") {
            //alert("请选择正确的文章分类");
            return false
        } else {
            $('#essay_cls').val($(this).val());
        }
    });

    //提交文章
    $('#sub_content').click(function () {
        var essay_name = $('#essay_title').val();
        if (essay_name == "") {
            //alert("文章名不能为空");
            $('#essay_title').focus();
            return false
        }

    });
    $('title').text('记录美好生活-' + $('#uname').val() + '-行成于思');
})