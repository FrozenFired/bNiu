module.exports = app => {
	/* ------------------------ 首页 登录页面 登录 登出 ------------------------ */
	app.get('/', (req, res) => {return res.render("./index", {title: "Home"});});

	app.get('/login', (req, res) => {return res.render("./login", {title: "Login"});});

	// app.post('/loginUser', Index.loginUser);
	app.post('/loginUser', async(req, res) => {
		// console.log("/loginUser");
		const User = require('../models/login/User');
		const bcrypt = require('bcryptjs');
		try {
			const code = req.body.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
			let pwd = String(req.body.pwd).replace(/(\s*$)/g, "").replace( /^\s*/, '');
			if(pwd.length == 0) pwd = " ";

			const user = await User.findOne({code: code});
			if(!user) return res.redirect("/error?info=loginUser,Error.!user");
			
			const isMatch = await bcrypt.compare(pwd, user.pwd);
			if(!isMatch) return res.redirect('/error?info=loginUser Code 密码不符, 请重新登陆');

			req.session.crUser = user;

			if(user.role == 1) return res.redirect('/bser');
			if(user.role == 99) return res.redirect('/cter');
			return res.redirect('/error?info=loginUser 登录角色错误，请联系管理员');
		} catch(error) {
			return res.redirect("/error?info=loginUser,Error&error="+error);
		}
	});

	app.get('/logout', (req, res) => {
		delete req.session.crUser;
		delete req.session.crAder;
		return res.redirect('/');
	});
};