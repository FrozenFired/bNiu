const Conf = require('../../../config/conf.js');
const MdFilter = require('../../../middle/mdFilter');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

exports.bsLangs = async(req, res) => {
	// console.log("/bsLangs");
	try{
		const crUser = req.session.crUser;
		const Langs = await LangDB.find().populate("langs.Lang");
		// Langs.forEach((item) => {console.log(item); });
		return res.render("./user/bser/lang/list", {title: "语言管理", Langs});
	} catch(error) {
		return res.redirect("/error?info=bsLangs,Error&error="+error);
	}
}

exports.bsLangAdd = async(req, res) => {
	// console.log("/bsLangAdd");
	try{
		const Langs = await LangDB.find();
		return res.render("./user/bser/lang/add", {title: "添加语言", Langs});
	} catch(error) {
		return res.redirect("/error?info=bsLangAdd,Error&error="+error);
	}
}

exports.bsLangNew = async(req, res) => {
	// console.log("/bsLangNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 2 || obj.code.length > 3) return res.redirect("/error?info=bsLangNew,objCode");
		if(!obj.langs[0].nome) return res.redirect("/error?info=bsLangNew,objNome");
		obj.langs.forEach((lang) => {
			if(!lang.nome) lang.nome = '*';
		})
		const LangSame = await LangDB.findOne({code: obj.code});
		if(LangSame) return res.redirect("/error?info=bsLangNew,LangSame");
		const _object = new LangDB(obj);
		const LangSave = await	_object.save();
		const Langs = await LangDB.find({_id: {"$ne": LangSave._id}});
		for(let i=0; i<Langs.length; i++) {
			const Lang = Langs[i];
			Lang.langs.push({Lang: LangSave._id, nome: '*'});
			await Lang.save();
		}
		return res.redirect("/bsLangs");
	} catch(error) {
		return res.redirect("/error?info=bsLangNew,Error&error="+error);
	}
}

exports.bsLangUpdAjax = async(req, res) => {
	// console.log("/bsLangUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Lang的id
		const Lang = await LangDB.findOne({'_id': id})
		if(!Lang) return res.json({status: 500, message: "没有找到此语言信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		const val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		
		if(field == "nome") {
			const lang = Lang.langs.find((item) => {
				return String(item._id) == String(req.body.subid);
			});
			lang.nome = val;
		} else {
			Lang[field] = val;
		}

		const LangSave = Lang.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}