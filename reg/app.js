var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session=require("express-session");//session模块

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// 设置session
app.use(session({
    "name": "weixin", // 设置cookie的名称，他有个默认的 connect.sid
    "secret": "weixin", // 设置加密的字符串，它是一个必须的属性
    "cookie": { maxAge: 8000000000 }, //设置cookie的失效时间
    "resave": false, // 每次请求是否新设置session
    "saveUninitialized": false //每次请求是否初始化
}));
//跨域问题    1.设置文件头--加载中间件--设置响应头
app.use("*", function(req, res, next) {
	// res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
   	res.setHeader('Access-Control-Allow-Origin', '*');//所有地址可以请求
	res.setHeader("Access-Control-Allow-Methods", "*");
	res.setHeader("Access-Control-Allow-Headers", "*");
	next();//下一步
});	
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
