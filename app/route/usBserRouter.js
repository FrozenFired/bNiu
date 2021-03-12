const Lang = require('../controllers/user/bser/lang');
const Size = require('../controllers/user/bser/size');
const Pd = require('../controllers/user/bser/pd');

const postForm = require('connect-multiparty')();

module.exports = app => {
	/* ------------------------ 首页 登录页面 登录 登出 ------------------------ */
	app.get('/bser', bserIsLogin, (req, res) => {return res.render("./user/bser/index", {title: "Home Bser", crUser: req.session.crUser});});

	/* ------------------------ Pd ------------------------ */
	app.get('/bsPds', bserIsLogin, Pd.bsPds);

	/* ------------------------ Size ------------------------ */
	app.get('/bsSizes', bserIsLogin, Size.bsSizes);
	app.get('/bsSizeStandardAdd', bserIsLogin, Size.bsSizeStandardAdd);
	app.post('/bsSizeStandardNew', bserIsLogin, postForm, Size.bsSizeStandardNew);
	app.post('/bsSizeStandardUpdAjax', bserIsLogin, Size.bsSizeStandardUpdAjax);
	
	app.post('/bsSizeNewAjax', bserIsLogin, Size.bsSizeNewAjax);
	app.post('/bsSizeUpdAjax', bserIsLogin, Size.bsSizeUpdAjax);

	/* ------------------------ Lang ------------------------ */
	app.get('/bsLangs', bserIsLogin, Lang.bsLangs);
	app.get('/bsLangAdd', bserIsLogin, Lang.bsLangAdd);
	app.post('/bsLangNew', bserIsLogin, postForm, Lang.bsLangNew);
	app.post('/bsLangUpdAjax', bserIsLogin, Lang.bsLangUpdAjax);
};

const bserIsLogin = function(req, res, next) {
	const crUser = req.session.crUser;
	if(!crUser || crUser.role != 1) {
		return res.redirect('/error?info=bserIsLogin，需要您的管理者账户');
	} else {
		next();
	}
};