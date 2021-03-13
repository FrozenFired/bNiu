const Conf = require('../../../config/conf.js');
const MdFilter = require('../../../middle/MdFilter');
const _ = require('underscore');

const UserDB = require('../../../models/login/User');
const PdspuDB = require('../../../models/product/Pdspu');

exports.bsPdspus = async(req, res) => {
	// console.log("/bsPds");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/pd/list", {title: "产品管理", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPds,Error&error="+error);
	}
}