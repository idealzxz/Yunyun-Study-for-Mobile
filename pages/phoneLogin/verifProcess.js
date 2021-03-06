/**
* 输入状态：
* 1 电话号码为空
* 2 电话号码格式错误
* 3 密码为空
* 4 密码格式错误
* 5 没有进行滑动验证
* 6 验证码为空
* 7 验证码格式错误
* 0 没有问题  type === 0:去获取验证码 1:去登录
*/
export const allSituation = function(){
	const phone = this.$refs.phoneInput.text,
		  phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
		  pwd = this.$refs.passwordInput 
					? this.$refs.passwordInput.text 
					: '',
		  pwdReg = /^(\w){8,16}$/, //8-16位密码
		  vcode = this.$refs.verifycodeInput 
				    ? this.$refs.verifycodeInput.text
					: '',
		  vcodeReg = /^\d{6}$/ //6位验证码
	return [
			phone === '' ,
			!phoneReg.test(phone) ,
			pwd === '' ,
			!pwdReg.test(pwd) ,
			
			this.resultData === '' || !this.resultData.flag ,
			vcode === '' ,
			!vcodeReg.test(vcode)  ,
		];
}
export const loginProcess = new Map([
	[1, function(){
		this.$refs.phoneInput.color = '#fa6060';
		this.tipText = '请输入手机号'
	}],
	[2, function(){
		this.$refs.phoneInput.color = '#fa6060';
		this.tipText = '请输入正确的手机号'
	}],
	[3, function(){
		this.$refs.passwordInput.color = '#fa6060';
		this.tipText = '请输入密码'
	}],
	[4, function(){
		this.$refs.passwordInput.color = '#fa6060';
		this.tipText = '请输入正确的密码'
	}],
	[5, function(){this.tipText = '请先拖动滑块进行安全验证'}],
	[6, function(){
		this.$refs.verifycodeInput.color = '#fa6060';
		this.tipText = '验证码不能为空'
	}],
	[7, function(){
		this.$refs.verifycodeInput.color = '#fa6060';
		this.tipText = '请输入正确的验证码'
	}],
	[0, function(type = 1){ 
		let that = this,
			phone = this.$refs.phoneInput.text,
		    password = this.$refs.passwordInput ? this.$refs.passwordInput.text : '',
			vcode = this.$refs.verifycodeInput ? this.$refs.verifycodeInput.text : '';
		if(type === 1){
			//输入正确 请求登录接口 判断账号密码是否正确
			that.$request({
			   url: '/login',
			   method: 'GET',
			   data:{
				   phone,
				   password,
				   vcode,
			   }
			  }).then(res => {
					if(res.data.status === '200'){
						if(res.data.data['truepass']){
							let userInfo = res.data.data;
							that.tipText = ''
							console.log('登录成功');
							//获取当前时间,并写入
							userInfo['loginTime'] = this.formatTime(new Date());
							if(that.checkboxFlag){
								//存入用户缓存
								uni.setStorageSync('userInfo', userInfo);
								//vuex获取缓存
								that.$store.commit('common/getUserInfo');
							}else{
								//一次性登录
								that.$store.commit('common/changeUserInfo',userInfo)
							}
							//登录成功提示
							uni.showToast({
							    title: '登录成功,跳转至登录页面',
								icon:'none'
							});
							//获取 购物车和优惠券信息 
							that.$store.dispatch('cart/request_cart').then(() => {
								setTimeout( () => {
								    uni.hideToast();
									//跳转到首页
									uni.switchTab({
										url: '/pages/index/index'
									});
								}, 1000);
							})
						}else{
							that.tipText = '账号或密码错误'
						}
					}
			})
		}else if(type === 0){
			//提交手机号获取验证码
			this.$request({
			   url: '/getVCode',
			   method: 'GET',
			   data:{
				   phone,
			   }
			  }).then(res => {
				  if(res.data.status === '200' ? res.data.data.send : false){
					  this.tipText = '';
					  this.codeExpiration = 30;
					  //再次能提交验证码 倒计时
					  let interval = setInterval(() => {
					    --this.codeExpiration;
					  }, 1000)
					  setTimeout(() => {
					     clearInterval(interval)
					     this.codeExpiration = 0
					  }, 30000)
				  }
			  })
		}
	}]
])