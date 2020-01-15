var express = require('express');
var router = express.Router();
var mongo=require("./db.js");
var crypto=require("crypto");
var jwt=require("./mytoken.js");//生成token的模块  sign  verify


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 注册接口--把前端传来的数据 插入到数据库		
router.post("/reg",function(req,res){
	// 整理前端发来的数据
	var userInfo={
		// 数据库字段
		username:req.body.username, //用户名
		phone:req.body.phone,//手机
		powerCode:req.body.powerCode,//权限码 0  1
		sex:req.body.sex,//性别
		createDate:new Date().toLocaleString(),//注册时间
		freeze:false // 用户的冻结状态   true冻结  false 非冻结
	}
	//加密密码 
	var  password=crypto.createHash('md5').update(req.body.password).digest('base64');
	userInfo.password=password;
	var power=req.body.powerCode=="0" ?"普通用户":"会员";
	userInfo.power=power;
	var  phone=/^1[3|4|5|6|7|8|9]\d{9}/.test(req.body.phone) ?true:false;
	if(phone){
		mongo("find","qquser",{username:req.body.username},function(result){
			if(result.length==0){
				mongo("insert","qquser",userInfo,function(result){
					// result---{result:{n:1,ok:1}}--增加的返回结果
					 if(result.result.n==1){
						 res.send({success:"注册成功"});
					 }else{
						 res.send({error:"预期之外的错误"});
					 }
				})
			}else{
				res.send({"error":"该用户已注册"});
			}
		})
	}else{
		res.send({error:"手机不符合规则"});
	}

})
// 验证码接口	
router.post("/veri",function(req,res){
	 if(req.body.action=="getveri"){
			var arr=["a","b","c","d","e","f","g","h","1","2","3","6","8"];
			var code="";
			for(var i=0;i<4;i++){
				var index=Math.floor(Math.random()*arr.length);
				code+=arr[index];
			}
			req.session.veri=code;	//存验证码到session
			res.send({veri:code})//把验证码返回给前端	
			// 把生成验证码存储一下 前端发送来验证码进行比较
			//session模块 可以存储一些数据  cookie--session完成登录验证
		}else if(req.body.action=="checkveri"){
			// 校验验证码
			console.log(req.session);
				console.log(req.body.veri,"-------------",req.session.veri)
			if(req.body.veri==req.session.veri){
				res.send({success:"验证码正确"})
			}else{
				res.send({error:"验证码错误"})
			}
		}	
})
// 登录接口
router.post("/login",function(req,res){
	// 密码加密
	var  password=crypto.createHash('md5').update(req.body.password).digest('base64');
	mongo("find","qquser",{username:req.body.username},function(result){
		if(result.length!=0){
			if(result[0].password==password){
				if(result[0].phone==req.body.phone){
				 
					// 生成token 		
					var token=jwt.sign(req.body.username,"60m");
							
					res.send({
						success:"登录成功",
						token:token//把生成的token返回给前端
					});		
					
				}else{
					res.send({error:"手机号错误"})
				}			
			}else{
				res.send({error:"密码错误"})
			}	
		}else{
			res.send({error:"用户名错误"})
		}
	})
	
})
// bootstrap
//购买接口
router.post("/buy",function(req,res){
	// 判断用户是否登录
	console.log(req.body.token)
	//token----是一种令牌 前后端传输 验证码用户信息
	// verify(签发过的token,回调函数)
	jwt.verify(req.body.token,function(err,data){
		console.log(data)
		if(data){
			res.send({
				tips:"您以支付："+req.body.price,
				success:"购买成功"
			})
		}else{
			res.send({error:"请登录"});
		}
	})	
})

//首页
router.post("/sy",function(req,res){
	mongo("find","qquser",{},function(result){
		var num=Number(result.length);
		
		mongo("page","qquser",{},function(result){
			res.send(result)
		},{createDate:1},0,6)
		
		
		
		
	})
	
})


//尾页
router.post("/wy",function(req,res){
	mongo("find","qquser",{},function(result){
		var num1=Number(result.length)%6;
		var num=Number(result.length)-num1;
		var n=result.length
		mongo("page","qquser",{},function(result){
			res.send({result:result,num:n})
		},{createDate:1},num,num1)
		
		
		
		
	})
	
})





//分页
router.post("/getuserlist",function(req,res){
	var num=Number(req.body.page)*6;
	mongo("page","qquser",{},function(result){
		res.send(result)
	},{createDate:1},num,6)
	
})








module.exports = router;
