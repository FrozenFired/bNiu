const Lang = require('../controllers/user/bser/lang');
const Size = require('../controllers/user/bser/size');
const Color = require('../controllers/user/bser/color');
const Pattern = require('../controllers/user/bser/pattern');
const MtCateg = require('../controllers/user/bser/mtCateg');
const Mtspu = require('../controllers/user/bser/mtspu');
const Pdspu = require('../controllers/user/bser/pdspu');

const MdFile = require('../middle/MdFile');

const postForm = require('connect-multiparty')();

module.exports = app => {
	/* ------------------------ 首页 登录页面 登录 登出 ------------------------ */
	app.get('/bser', bserIsLogin, (req, res) => {return res.render("./user/bser/index", {title: "Home Bser", crUser: req.session.crUser});});

	/* ------------------------ Pdspu ------------------------ */
	app.get('/bsPdspus', bserIsLogin, Pdspu.bsPdspus);

	/* ------------------------ MtCateg ------------------------ */
	app.get('/bsMtCategs', bserIsLogin, MtCateg.bsMtCategs);
	app.get('/bsMtCategAdd', bserIsLogin, MtCateg.bsMtCategAdd);
	app.get('/bsMtCateg/:id', bserIsLogin, MtCateg.bsMtCateg);
	app.get('/bsMtCategUp/:id', bserIsLogin, MtCateg.bsMtCategUp);
	app.get('/bsMtCategDel/:id', bserIsLogin, MtCateg.bsMtCategDel);
	app.post('/bsMtCategNew', bserIsLogin, postForm, MtCateg.bsMtCategNew);
	app.post('/bsMtCategUpd', bserIsLogin, postForm, MtCateg.bsMtCategUpd);

	/* ------------------------ Pattern ------------------------ */
	app.get('/bsPatterns', bserIsLogin, Pattern.bsPatterns);
	app.get('/bsPatternAdd', bserIsLogin, Pattern.bsPatternAdd);
	app.post('/bsPatternNew', bserIsLogin, postForm, Pattern.bsPatternNew);
	app.post('/bsPatternUpdAjax', bserIsLogin, Pattern.bsPatternUpdAjax);
	app.post('/bsPatternPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Pattern.bsPatternPhotoUpd);

	/* ------------------------ Size ------------------------ */
	app.get('/bsSizes', bserIsLogin, Size.bsSizes);
	app.get('/bsSizeStandardAdd', bserIsLogin, Size.bsSizeStandardAdd);
	app.post('/bsSizeStandardNew', bserIsLogin, postForm, Size.bsSizeStandardNew);
	app.post('/bsSizeStandardUpdAjax', bserIsLogin, Size.bsSizeStandardUpdAjax);
	
	app.post('/bsSizeNewAjax', bserIsLogin, Size.bsSizeNewAjax);
	app.post('/bsSizeUpdAjax', bserIsLogin, Size.bsSizeUpdAjax);

	/* ------------------------ Color ------------------------ */
	app.get('/bsColors', bserIsLogin, Color.bsColors);
	app.get('/bsColorAdd', bserIsLogin, Color.bsColorAdd);
	app.post('/bsColorNew', bserIsLogin, postForm, Color.bsColorNew);
	app.post('/bsColorUpdAjax', bserIsLogin, Color.bsColorUpdAjax);

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