# coding=utf-8
from flask import Flask, render_template, request, redirect, session, jsonify, make_response, send_from_directory
from hashlib import md5
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import flask_whooshalchemyplus
from flask_script import Manager
from jieba.analyse.analyzer import ChineseAnalyzer
from PIL import Image, ExifTags
import os

app = Flask(__name__)

# 配置数据库
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:weige521@127.0.0.1:3306/xingchengyusi'  # 链接数据库
# 设置每次请求结束后会自动提交数据库中的改动
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
# 查询时会显示原始SQL语句
# app.config['SQLALCHEMY_ECHO'] = True

# session
app.config['SECRET_KEY'] = os.urandom(24)

# 实例数据库对象
db = SQLAlchemy(app)
# 初始化
flask_whooshalchemyplus.init_app(app)

manager = Manager(app)


class User(db.Model):
    """用户"""
    __tablename__ = 'users'  # 定义表名
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(64), unique=True)  # 用户名，64位以内，唯一
    user_pswd_md5 = db.Column(db.String(32))  # 用户密码，MD5加密32位
    register_time = db.Column(db.String(64))  # 注册时间
    email = db.Column(db.String(32), unique=True)  # 用户邮箱，唯一


class Essay(db.Model):
    """文章"""
    __tablename__ = 'essay'
    __searchable__ = ['essay_title', 'essay_content']
    __analyzer__ = ChineseAnalyzer()
    id = db.Column(db.Integer, primary_key=True)  # id
    essay_title = db.Column(db.String(128), unique=True, index=True)  # 文章名称，唯一，创建索引
    essay_content = db.Column(db.Text())  # 文章内容
    essay_cls = db.Column(db.String(32))  # 文章分类
    essay_push_time = db.Column(db.String(64))  # 发布时间
    essay_push_user = db.Column(db.String(32))  # 发布人
    essay_scan = db.Column(db.Integer, default=0)  # 浏览次数


class Essay_Class(db.Model):
    """文章分类"""
    __tablename__ = 'essay_class'
    id = db.Column(db.Integer, primary_key=True)  # id
    essay_class_name = db.Column(db.String(32), unique=True)  # 分类名称唯一


class Comments(db.Model):
    """评论"""
    __tabelname__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    comment_user = db.Column(db.String(64))  # name
    comment_user_head = db.Column(db.String(128))  # 头像
    comment_essay = db.Column(db.String(128))  # 评论对应的文章
    comment_text = db.Column(db.Text())  # 评论内容
    comment_time = db.Column(db.String(64))  # 评论时间
    comment_like = db.Column(db.Integer, default=0)  # 评论点赞
    comment_like_ip = db.Column(db.Text())  # ip校验


@app.errorhandler(404)
def error_404(e):
    """404页面"""
    return render_template('html/404.html',e=e)

@app.route('/')
def index():
    """首页"""
    return render_template('html/index.html')


@app.route('/admin')
def admin_index():
    """后台首页"""
    uname = session.get('username')
    if uname:
        if uname == "admin":
            return render_template('html/admin.html')
        else:
            return redirect('/')
    else:
        return redirect('/user_login')


@app.route('/add_essay_cls', methods=['POST'])
def add_essay_cls():
    """后台添加分类"""
    data = request.get_json()
    cls_name = data.get("cls_text")
    if Essay_Class.query.filter_by(essay_class_name=cls_name).first():
        return jsonify({"msg": "分类已存在"})
    else:
        cls = Essay_Class(essay_class_name=cls_name)
        db.session.add(cls)
        db.session.commit()
        return jsonify({"msg": "ok"})


@app.route('/remove_cls', methods=['POST'])
def remove_cls():
    """删除分类"""
    data = request.get_json()
    try:
        cls_name = data.get("cls_name")
        cls = Essay_Class.query.filter_by(essay_class_name=cls_name).first()
        db.session.delete(cls)
        db.session.commit()
        return jsonify({"msg": "ok"})
    except:
        return jsonify({"msg": "err"})


@app.route('/load_index_essay', methods=['POST'])
def load_index_essay():
    # 数据库查询所有文章
    essay_sql_list = Essay.query.order_by("-id").all()
    # 拼接成json数据返回前端
    essay_list = []
    for essay in essay_sql_list:
        # 查询评论条数
        essay_comments_len = Comments.query.filter_by(comment_essay=essay.essay_title).all()
        essay_info = {
            "essay_id": essay.id,
            "essay_title": essay.essay_title,
            "essay_content": essay.essay_content,
            "essay_cls": essay.essay_cls,
            "essay_push_time": essay.essay_push_time,
            "essay_push_user": essay.essay_push_user,
            "essay_scan": essay.essay_scan,
            "essay_comments_len": len(essay_comments_len)
        }
        essay_list.append(essay_info)
    return jsonify({"essay_list": essay_list})


@app.route('/search_index')
def search_index():
    """文章搜索首页"""
    flask_whooshalchemyplus.index_one_model(Essay)
    return render_template('html/search_index.html')


@app.route('/search', methods=['POST'])
def search_result():
    """搜索返回"""
    import re
    data = request.get_json()
    keyword = data.get("keyword")
    search_result_all = Essay.query.whoosh_search(keyword).all()
    if search_result_all:
        search_result_list = []
        for search_ret in search_result_all:
            dr = re.compile(r'<[^>]+>', re.S)
            data = {
                "essay_id": search_ret.id,
                "essay_title": search_ret.essay_title,
                "essay_content": dr.sub('', search_ret.essay_content)[:64],
                "essay_cls": search_ret.essay_cls,
                "essay_push_time": search_ret.essay_push_time,
                "essay_push_user": search_ret.essay_push_user,
                "essay_scan": search_ret.essay_scan
            }
            search_result_list.append(data)
        return jsonify({"search_result_list": search_result_list})
    else:
        return jsonify({"msg": "null"})


@app.route('/user_login', methods=['GET'])
def user_login():
    """user登录页"""
    session_name = session.get('username')
    if session_name:
        return redirect('/user_write_essay/' + session_name)
    else:
        return render_template('html/user_login.html')


@app.route('/user_login_check', methods=['POST'])
def user_login_check():
    """user登录校验"""
    data = request.get_json()
    name = data.get("uname")
    pswd = data.get("upswd")
    m = md5()
    m.update(bytes(str(pswd), encoding='utf-8'))
    pswd_md5 = m.hexdigest()
    reg_time = datetime.now().__str__()[:-16]

    # 查询当前用户
    user = User.query.filter_by(user_name=name).first()
    if user:
        if user.user_pswd_md5 == pswd_md5:
            session['username'] = user.user_name
            return jsonify({"msg": 'user_write_essay/' + user.user_name})
        else:
            return jsonify({"msg": "密码错误"})
    else:
        new_user = User(user_name=name, user_pswd_md5=pswd_md5, register_time=reg_time)
        db.session.add(new_user)
        db.session.commit()
        session['username'] = name
        return jsonify({"msg": 'user_write_essay/' + name})


@app.route('/exit_login', methods=['GET'])
def exit_login():
    """user退出登录"""
    session.pop('username')
    return redirect('/')


@app.route('/user_write_essay/<string:username>')
def user_write_essay(username):
    """user写文章页"""
    session_name = session.get('username')
    # 如果用户的session等于登录的session返回，否则重新登录
    if session_name is not None and session_name == username:
        return render_template('html/user_write_essay.html', username=username)
    else:
        return render_template('html/user_login.html')


@app.route('/submit_essay', methods=['POST'])
def submit_essay():
    """发布文章"""
    if request.method == 'POST':
        title = request.form['essay_title']
        content = request.form['content']
        cls = request.form['essay_cls']
        push_time = datetime.now().__str__()[:-16]
        push_user = request.form['user']
        if cls:
            essay = Essay(essay_title=title, essay_content=content, essay_cls=cls, essay_push_time=push_time,
                          essay_push_user=push_user)
            db.session.add(essay)
            db.session.commit()
            return redirect('/')
        else:
            essay = Essay(essay_title=title, essay_content=content, essay_cls="文章", essay_push_time=push_time,
                          essay_push_user=push_user)
            db.session.add(essay)
            db.session.commit()
            return redirect('/')


@app.route('/essay/<string:title>', methods=['GET'])
def essay_detaile(title):
    """获取文章详细信息"""
    essay = Essay.query.filter_by(essay_title=title).first()
    if essay:
        # 文章浏览次数加1
        essay.essay_scan += 1
        db.session.add(essay)
        db.session.commit()
        return render_template('html/essay_detaile.html', essay=essay)
    else:
        return "没有文章"


@app.route('/get_prev_or_next', methods=['GET', 'POST'])
def get_prev_or_next():
    """获取当前文章的上一个下一个"""
    data = request.get_json()
    essay_title = data.get("essay_title")
    print(essay_title)
    # 查询当前文章
    current_essay = Essay.query.filter_by(essay_title=essay_title).first()
    essay_all = Essay.query.all()
    for index, essay in enumerate(essay_all):
        if essay == current_essay:
            essay_prev_index = index + 1
            essay_next_index = index - 1
            try:
                essay_prev = essay_all[essay_prev_index].essay_title
            except:
                essay_prev = ''
            try:
                essay_next = essay_all[essay_next_index].essay_title
            except:
                essay_next = ''
            if essay_next_index == -1:
                essay_next = ''
            return jsonify({"essay_prev": essay_prev, "essay_next": essay_next})


@app.route('/load_hot_essay', methods=['POST'])
def load_hot_essay():
    """加载首页热门推荐文章"""
    hot_essay_all = Essay.query.order_by('-essay_scan').all()
    hot_essay_list = []
    for hot_essay in hot_essay_all[:5]:
        if len(hot_essay.essay_title) >= 20:
            essay_title = hot_essay.essay_title[:20] + "..."
        else:
            essay_title = hot_essay.essay_title
        data = {
            "essay_title": essay_title,
            "essay_url": "/essay/" + hot_essay.essay_title,
        }
        hot_essay_list.append(data)
    return jsonify({"hot_essay_list": hot_essay_list})


@app.route('/load_related_essay', methods=['POST'])
def load_related_essay():
    """加载相关推荐"""
    data = request.get_json()
    essay_title = data.get("essay_title")
    import difflib
    essay_title_list = []
    # 存放相似度高的列表
    similarity_list = []
    essay_list = Essay.query.filter(Essay.essay_title != essay_title).all()
    for essay in essay_list:
        essay_title_list.append(essay.essay_title)
    for t in essay_title_list:
        # 获取相似度
        similarity = difflib.SequenceMatcher(None, essay_title, t).quick_ratio()
        if similarity > 0:
            similarity_list.append(t)
    if len(similarity_list) > 0:
        return jsonify({"similarity_list": similarity_list[:5]})
    else:
        return jsonify({"similarity_list": "null"})


@app.route('/tuchuang', methods=['GET'])
def tuchuang():
    """图床首页"""
    return render_template('html/tuchuang.html', copy_info='none')


@app.route('/create_file_url', methods=['GET', 'POST'])
def create_file_url():
    """生成文件url返回图床"""
    if request.method == "POST":
        file = request.files['files']
        file_name = file.filename
        hint = "生成的文件url如下:"
        try:
            file.save(os.path.join('static/files/file/', file_name))
        except:
            pass
        return render_template('html/tuchuang.html', file_url='http://192.168.0.107/static/files/file/' + file_name,
                               hint=hint, copy_info='block')
    else:
        return render_template('html/tuchuang.html', copy_info='none')


@app.route('/get_essay_class', methods=['POST'])
def get_essay_class():
    """获取文章分类"""
    essay_class_all = Essay_Class.query.all()
    essay_class_list = []
    for cls in essay_class_all:
        cls_all = Essay.query.filter_by(essay_cls=cls.essay_class_name).all()
        if cls_all:
            essay_class_number = len(cls_all)
        else:
            essay_class_number = 0
        data = {
            "essay_class_id": cls.id,
            "essay_class_name": cls.essay_class_name,
            "essay_class_number": essay_class_number
        }
        essay_class_list.append(data)
    return jsonify({"essay_class_list": essay_class_list})


@app.route('/essay_cls/<string:cls_name>')
def essay_cls_index(cls_name):
    """分类页"""
    return render_template('html/essay_cls_index.html', cls_name=cls_name)


@app.route('/load_cls_essay', methods=['POST'])
def load_cls_essay():
    """加载分类文章"""
    # 获取分类名称
    data = request.get_json()
    cls_name = data.get("cls_name")
    essay_cls_all = Essay.query.filter_by(essay_cls=cls_name).all()
    essay_cls_list = []
    if essay_cls_all:
        for essay in essay_cls_all:
            essay_info = {
                "essay_id": essay.id,
                "essay_title": essay.essay_title,
                "essay_content": essay.essay_content,
                "essay_cls": essay.essay_cls,
                "essay_push_time": essay.essay_push_time,
                "essay_push_user": essay.essay_push_user,
                "essay_scan": essay.essay_scan
            }
            essay_cls_list.append(essay_info)
        return jsonify({"essay_cls_list": essay_cls_list})
    else:
        return jsonify({"essay_cls_list": "null"})


@app.route('/get_userinfo', methods=['POST'])
def get_userinfo():
    """获取用户信息"""
    userinfo_all = User.query.all()
    userinfo_list = []
    for user in userinfo_all:
        data = {
            "id": user.id,
            "user_name": user.user_name,
            "register_time": user.register_time,
            "email": user.email
        }
        userinfo_list.append(data)
    return jsonify({"userinfo_list": userinfo_list})


@app.route('/remove_user', methods=['POST'])
def remove_user():
    """注销用户"""
    data = request.get_json()
    user_name = data.get("user_name")

    user = User.query.filter_by(user_name=user_name).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "ok"})
    else:
        return jsonify({"msg": "用户不存在"})


@app.route('/remove_essay', methods=['POST'])
def remove_essay():
    """删除文章"""
    data = request.get_json()
    essay_name = data.get("essay_name")
    essay = Essay.query.filter_by(essay_title=essay_name).first()
    if essay:
        db.session.delete(essay)
        db.session.commit()
        return jsonify({"msg": "ok"})
    else:
        return jsonify({"msg": "文章不存在"})


@app.route('/get_statistics_info', methods=['POST'])
def get_statistics_info():
    """加载网站统计信息"""
    user = User.query.all()
    essay = Essay.query.all()
    essay_cls = Essay_Class.query.all()
    try:
        end_time = Essay.query.order_by('-id').first().essay_push_time
        return jsonify({"user": len(user), "essay": len(essay), "essay_cls": len(essay_cls), "end_time": end_time})
    except:
        return jsonify({"user": len(user), "essay": len(essay), "essay_cls": len(essay_cls), "end_time": ""})


@app.route('/load_comments', methods=['POST'])
def load_comments():
    """加载文章评论"""
    data = request.get_json()
    essay_title = data.get('essay_title')
    essay_comments_all = Comments.query.filter_by(comment_essay=essay_title).order_by('-comment_like').all()
    essay_comments_list = []
    if essay_comments_all:
        for comments in essay_comments_all:
            # 判断是不是作者的评论
            essay = Essay.query.filter_by(essay_title=essay_title).first()
            if comments.comment_user == essay.essay_push_user:
                is_author = " | 作者"
            else:
                is_author = ""
            item = {
                "comments_id": comments.id,
                "comment_user": comments.comment_user,
                "comment_user_head": comments.comment_user_head,
                "comment_essay": comments.comment_essay,
                "comment_text": comments.comment_text,
                "comment_time": comments.comment_time,
                "comment_like": comments.comment_like,
                "is_author": is_author
            }
            essay_comments_list.append(item)
        return jsonify({'essay_comments_list': essay_comments_list})
    else:
        return jsonify({'essay_comments_list': 'null'})


@app.route('/submit_comments', methods=['POST'])
def submit_comments():
    """发布文章评论"""
    user = session.get('username')
    if user:
        data = request.get_json()
        comment_info = data.get('comment_info')
        essay_title = data.get('essay_title')
        head_img_url = '/static/img/icon.png'
        time = datetime.now().__str__()[:-7]
        comments = Comments(comment_user=user, comment_user_head=head_img_url, comment_essay=essay_title,
                            comment_text=comment_info, comment_time=time, comment_like_ip='')
        db.session.add(comments)
        db.session.commit()
        return jsonify({'msg': 'ok'})
    else:
        return jsonify({'msg': '请登录后操作'})


@app.route('/reply_comments', methods=['POST'])
def reply_comments():
    """评论点赞"""
    data = request.get_json()
    comments_id = data.get('comments_id')
    ip = request.remote_addr
    comments = Comments.query.filter_by(id=comments_id).first()
    if ip in comments.comment_like_ip:
        return jsonify({'msg': '不可重复点赞'})
    else:
        comments.comment_like += 1
        comments.comment_like_ip += (ip + ',')
        db.session.add(comments)
        db.session.commit()
        return jsonify({'msg': 'ok', 'like_number': comments.comment_like})


@app.route('/remove_comments', methods=['POST'])
def remove_comments():
    """后台删除评论"""
    data = request.get_json()
    comments_id = data.get('comments_id')
    comments = Comments.query.filter_by(id=comments_id).first()
    if comments:
        db.session.delete(comments)
        db.session.commit()
        return jsonify({'msg': 'ok'})
    else:
        return jsonify({'msg': 'err'})


def resize_img(img_name):
    """压缩图片"""
    path = "D:\\XingChengYuSi\\static\\files\\image\\" #这里改成自己的存放图片的路径,windows路径
    img_size = os.path.getsize(path + img_name)
    if img_size > 2048000:
        with Image.open(path + img_name) as im:
            width, height = im.size
            new_width = width // 2
            new_height = int(new_width * height * 1.0 / width)
            print('{}的width{},height{}'.format(img_name, new_width, new_height))
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == "Orientation":
                    break
            exif = dict(im._getexif().items())
            if exif[orientation] == 3:
                im = im.rotate(180, expand=True)
            elif exif[orientation] == 6:
                im = im.rotate(270, expand=True)
            elif exif[orientation] == 8:
                im = im.rotate(90, expand=True)
            resize_im = im.resize((new_width, new_height))
            resize_im.save(path + img_name)
            print('压缩图片{}成功,压缩前大小为{},压缩后大小为{}'.format(img_name, img_size, os.path.getsize(path + img_name)))


@app.route('/upload/', methods=['GET', 'POST'])
def upload():
    import json
    action = request.args.get('action')

    # 配置信息
    CONFIG = {
        # 上传图片
        "imageActionName": "uploadimage",
        "imageFieldName": "upfile",
        "imageMaxSize": 4096000,
        "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
        "imageCompressEnable": "true",
        "imageCompressBorder": 1600,
        "imageInsertAlign": "none",
        "imageUrlPrefix": "",
        "imagePathFormat": "/static/files/image/{yyyy}{mm}{dd}/{time}{rand:6}",

        # 上传视频
        "videoActionName": "uploadvideo",
        "videoFieldName": "upfile",
        "videoPathFormat": "/static/files/video/{yyyy}{mm}{dd}/{time}{rand:6}",
        "videoUrlPrefix": "",
        "videoMaxSize": 102400000,
        "videoAllowFiles": [
            ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
            ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid"],

        # 上传文件
        "fileActionName": "uploadfile",
        "fileFieldName": "upfile",
        "filePathFormat": "/static/files/file//{yyyy}{mm}{dd}/{time}{rand:6}",
        "fileUrlPrefix": "",
        "fileMaxSize": 51200000,
        "fileAllowFiles": [
            ".png", ".jpg", ".jpeg", ".gif", ".bmp",
            ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
            ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid",
            ".rar", ".zip", ".tar", ".gz", ".7z", ".bz2", ".cab", ".iso",
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt", ".md", ".xml"
        ],

    }

    # 初始化时返回配置信息
    if action == 'config':
        result = CONFIG
        return json.dumps(result)
    # 上传文件
    if action in ['uploadimage', 'uploadvideo', 'uploadfile']:
        upfile = request.files['upfile']  # 获取文件对象
        if action == 'uploadimage':
            dir_name = 'image'
        elif action == 'uploadvideo':
            dir_name = 'video'
        elif action == 'uploadfile':
            dir_name = 'file'
        if os.path.exists(os.path.join('static/files/' + dir_name + '/', upfile.filename)):
            print(upfile.filename, '文件已存在')
        else:
            upfile.save(os.path.join('static/files/' + dir_name + '/', upfile.filename))
            if upfile.filename[-4:] in CONFIG["imageAllowFiles"]:
                print(upfile.filename[-4:])
                resize_img(upfile.filename)

        result = {
            "state": "SUCCESS",
            "url": "http://192.168.0.107/static/files/" + dir_name + "/" + upfile.filename, #这里也改成你自己的路径
            "title": upfile.filename,
            "original": upfile.filename
        }
        return json.dumps(result)


if __name__ == '__main__':
    manager.run()
