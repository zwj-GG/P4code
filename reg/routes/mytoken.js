var jwt=require("jsonwebtoken")//jsonwebtoken---生成token模块

var key="今天星期一"; 
//ssh密钥  加密/解密   2套公式

module.exports={
    //签发
    // api
    // payload  需要签发的数据
    // time     过期时间
				   
    sign:function(payload,time){
        // 载荷
	// sign---签名  "sadfoihK39024092394u9skdfksh"
				// {username:1,password:2}        
				//  time  60s  60m  60h 60d	 --token的过期时间  
        return jwt.sign(payload,key,{expiresIn:time})
    },
	
    //认证
    //api
    //tokenId    签发的token值
    //callback   回调函数
    verify:function(tokenId,callback){
        jwt.verify(tokenId,key,callback)
		
    }
}
