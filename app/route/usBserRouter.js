const Lang = require('../controllers/user/bser/lang');
const Size = require('../controllers/user/bser/size');
const Color = require('../controllers/user/bser/color');
const Ptern = require('../controllers/user/bser/ptern');
const MtCateg = require('../controllers/user/bser/mtCateg');
const Mtrial = require('../controllers/user/bser/mtrial');
const PdCateg = require('../controllers/user/bser/pdCateg');
const PdNome = require('../controllers/user/bser/pdNome');
const PdspuBasic = require('../controllers/user/bser/pdspu/basic');
const PdspuAttr = require('../controllers/user/bser/pdspu/attr');

const MdFile = require('../middle/MdFile');

const postForm = require('connect-multiparty')();

module.exports = app => {
	/* ------------------------ 首页 登录页面 登录 登出 ------------------------ */
	app.get('/bser', bserIsLogin, (req, res) => {return res.render("./user/bser/index", {title: "Home Bser", crUser: req.session.crUser});});

	/* ============================================= Pdspu ============================================= */
	/* ------------------------ basic ------------------------ */
	app.get('/bsPdspuAdd', bserIsLogin, PdspuBasic.bsPdspuAdd);
	app.post('/bsPdspuNew', bserIsLogin, postForm, PdspuBasic.bsPdspuNew);

	app.get('/bsPdspus', bserIsLogin, PdspuBasic.bsPdspus);
	app.get('/bsPdspu/:id', bserIsLogin, PdspuBasic.bsPdspu);
	app.get('/bsPdspuUp/:id', bserIsLogin, PdspuBasic.bsPdspuUp);
	app.post('/bsPdspuUpd', bserIsLogin, postForm, PdspuBasic.bsPdspuUpd);
	app.post('/bsPdspuUpdAjax', bserIsLogin, PdspuBasic.bsPdspuUpdAjax);
	app.post('/bsPdspuPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, PdspuBasic.bsPdspuPhotoUpd);

	/* ------------------------ attr ------------------------ */
	app.get('/bsPdspuSizeUp/:id', bserIsLogin, PdspuAttr.bsPdspuSizeUp);
	app.get('/bsPdspuSizeUpdAjax', bserIsLogin, PdspuAttr.bsPdspuSizeUpdAjax);
	app.get('/bsPdspuSizeDelAjax', bserIsLogin, PdspuAttr.bsPdspuSizeDelAjax);

	app.get('/bsPdspuColorUp/:id', bserIsLogin, PdspuAttr.bsPdspuColorUp);
	app.get('/bsPdspuColorUpdAjax', bserIsLogin, PdspuAttr.bsPdspuColorUpdAjax);

	app.get('/bsPdspuPternUp/:id', bserIsLogin, PdspuAttr.bsPdspuPternUp);
	app.get('/bsPdspuPternUpdAjax', bserIsLogin, PdspuAttr.bsPdspuPternUpdAjax);

	app.get('/bsPdspuMtrialUp/:id', bserIsLogin, PdspuAttr.bsPdspuMtrialUp);
	app.get('/bsPdspuMtrialUpdAjax', bserIsLogin, PdspuAttr.bsPdspuMtrialUpdAjax);

	app.post('/bsPdSpusPhotosNew', bserIsLogin, postForm, MdFile.newFiles, PdspuAttr.bsPdSpusPhotosNew);
	app.get('/bsPdSpusPhotosDel/:id', bserIsLogin, PdspuAttr.bsPdSpusPhotosDel);

	app.post('/bsPdspuMtDosageUpdAjax', bserIsLogin, PdspuAttr.bsPdspuMtDosageUpdAjax);
	/* ============================================= Pdspu ============================================= */

	/* ------------------------ PdNome ------------------------ */
	app.get('/bsPdNomes', bserIsLogin, PdNome.bsPdNomes);
	app.get('/bsPdNomeAdd', bserIsLogin, PdNome.bsPdNomeAdd);
	app.post('/bsPdNomeNew', bserIsLogin, postForm, PdNome.bsPdNomeNew);
	app.post('/bsPdNomeUpdAjax', bserIsLogin, PdNome.bsPdNomeUpdAjax);

	/* ------------------------ PdCateg 产品分类 ----------------------- */
	app.get('/bsPdCategs', bserIsLogin, PdCateg.bsPdCategs);
	app.get('/bsPdCategAdd', bserIsLogin, PdCateg.bsPdCategAdd);
	app.get('/bsPdCateg/:id', bserIsLogin, PdCateg.bsPdCateg);
	app.get('/bsPdCategUp/:id', bserIsLogin, PdCateg.bsPdCategUp);
	app.get('/bsPdCategDel/:id', bserIsLogin, PdCateg.bsPdCategDel);
	app.post('/bsPdCategNew', bserIsLogin, postForm, PdCateg.bsPdCategNew);
	app.post('/bsPdCategUpd', bserIsLogin, postForm, PdCateg.bsPdCategUpd);

	/* ------------------------ PdCateg 产品分类 ----------------------- */
	app.get('/bsPdCategs', bserIsLogin, PdCateg.bsPdCategs);
	app.get('/bsPdCategAdd', bserIsLogin, PdCateg.bsPdCategAdd);
	app.get('/bsPdCateg/:id', bserIsLogin, PdCateg.bsPdCateg);
	app.get('/bsPdCategUp/:id', bserIsLogin, PdCateg.bsPdCategUp);
	app.get('/bsPdCategDel/:id', bserIsLogin, PdCateg.bsPdCategDel);
	app.post('/bsPdCategNew', bserIsLogin, postForm, PdCateg.bsPdCategNew);
	app.post('/bsPdCategUpd', bserIsLogin, postForm, PdCateg.bsPdCategUpd);

	/* ------------------------ Mtrial 材质 ------------------------ */
	app.get('/bsMtrials', bserIsLogin, Mtrial.bsMtrials);
	app.get('/bsMtrialAdd', bserIsLogin, Mtrial.bsMtrialAdd);
	app.get('/bsMtrial/:id', bserIsLogin, Mtrial.bsMtrial);
	app.get('/bsMtrialUp/:id', bserIsLogin, Mtrial.bsMtrialUp);
	app.post('/bsMtrialNew', bserIsLogin, postForm, Mtrial.bsMtrialNew);
	app.post('/bsMtrialUpd', bserIsLogin, postForm, Mtrial.bsMtrialUpd);
	app.post('/bsMtrialUpdAjax', bserIsLogin, Mtrial.bsMtrialUpdAjax);
	app.post('/bsMtrialPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Mtrial.bsMtrialPhotoUpd);

	/* ------------------------ MtCateg 材质分类 ----------------------- */
	app.get('/bsMtCategs', bserIsLogin, MtCateg.bsMtCategs);
	app.get('/bsMtCategAdd', bserIsLogin, MtCateg.bsMtCategAdd);
	app.get('/bsMtCateg/:id', bserIsLogin, MtCateg.bsMtCateg);
	app.get('/bsMtCategUp/:id', bserIsLogin, MtCateg.bsMtCategUp);
	app.get('/bsMtCategDel/:id', bserIsLogin, MtCateg.bsMtCategDel);
	app.post('/bsMtCategNew', bserIsLogin, postForm, MtCateg.bsMtCategNew);
	app.post('/bsMtCategUpd', bserIsLogin, postForm, MtCateg.bsMtCategUpd);

	/* ------------------------ Ptern ------------------------ */
	app.get('/bsPterns', bserIsLogin, Ptern.bsPterns);
	app.get('/bsPternAdd', bserIsLogin, Ptern.bsPternAdd);
	app.post('/bsPternNew', bserIsLogin, postForm, Ptern.bsPternNew);
	app.post('/bsPternUpdAjax', bserIsLogin, Ptern.bsPternUpdAjax);
	app.post('/bsPternPhotoUpd', bserIsLogin, postForm, MdFile.newFiles, Ptern.bsPternPhotoUpd);

	/* ------------------------ Size ------------------------ */
	app.get('/bsSizes', bserIsLogin, Size.bsSizes);
	app.get('/bsSizeSystAdd', bserIsLogin, Size.bsSizeSystAdd);
	app.post('/bsSizeSystNew', bserIsLogin, postForm, Size.bsSizeSystNew);
	app.post('/bsSizeSystUpdAjax', bserIsLogin, Size.bsSizeSystUpdAjax);
	
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