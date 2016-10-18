应该有一个favicon, 最好能和图书馆管理主题相关
需要一个一直启动着的服务，修改代码后自动刷新,前端永远是坑啊 -> 这个问题解决了，直接开一个supervisor

checkUserNoLogin

看看能不能顺便做一下手机上也能正常访问，现在navbar在手机上还有点问题x

考虑是不要要用flash，用来提示错误信息,  这个暂时没找到库，可以考虑最后自己手写一个

增加翻页面功能


可以加一个footer


可以加一个添加用户时自动生成密码的功能


用户名，密码加强check

外观还是要修改


创建用户的页面需要在前端卡一下密码，做各种check，后来再说


我觉得可以让admin有修改用户名的权限


加入日购的验证码机制

设定工号不能相同

Help版块的建设


查询支持正则表达式?


__数据库__:
users， 超级管理员， 普通管理员， 消费者
inventory 库存书籍， 各种属性（id,isbn,name,press,author,retail_price,count,图书图片），零售价，还有存量
purchase_list 进货清单，(id,isbn,name,press,author,cost_price,buying_count,status,create_time),状态有 已退货，未付款，已付款，已添加至库存
bill (buying_time,money,id,amount,customer)时间，收入支出价格，书名（点链接链到书id），数量，购买账号


弄一下表格的placeholder


实现一下填写isbn，自动从互联网上搜索书籍信息然后填表的功能