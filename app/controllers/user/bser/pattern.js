const Conf = require('../../../config/conf.js');
const MdFile = require('../../../middle/MdFile');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

const PatternDB = require('../../../models/attr/Pattern');

exports.bsPatterns = async(req, res) => {
	// console.log("/bsPatterns");
	try{
		const crUser = req.session.crUser;
		const Patterns = await PatternDB.find().sort({"weight": -1});
		return res.render("./user/bser/pattern/list", {title: "印花管理", Patterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPatterns,Error&error="+error);
	}
}

exports.bsPatternAdd = async(req, res) => {
	// console.log("/bsPatternAdd");
	try{
		return res.render("./user/bser/pattern/add", {title: "添加新印花", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPatternAdd,Error&error="+error);
	}
}

exports.bsPatternNew = async(req, res) => {
	// console.log("/bsPatternNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPatternNew,objCode");
		obj.photo = Conf.photo.pattern.def;
		const PatternSame = await PatternDB.findOne({code: obj.code});
		if(PatternSame) return res.redirect("/error?info=bsPatternNew,PatternSame");

		const _object = new PatternDB(obj);
		const PatternSave = await _object.save();
		return res.redirect("/bsPatterns");
	} catch(error) {
		return res.redirect("/error?info=bsPatternNew,Error&error="+error);
	}
}
exports.bsPatternUpdAjax = async(req, res) => {
	// console.log("/bsPatternUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Pattern的id
		const Pattern = await PatternDB.findOne({_id: id})
		if(!Pattern) return res.json({status: 500, message: "没有找到此印花信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值
		const type = req.body.type;	// 传输数据的类型
		if(type == "Int") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "updAjax 参数为整数, 请传递正确的参数"});
		} else {
			// type == "String"
			val = String(val).replace(/^\s*/g,"").toUpperCase();
		}

		const isFile = ["photo"];
		const field = req.body.field;
		if(field == "code") {
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PatternSame = await PatternDB.findOne({code: val});
			if(PatternSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(isFile.includes(field) && Pattern[field]) {
			if(val != Pattern[field]) {
				MdFile.delFile(Pattern[field]);
				if(!val) val = Conf.photo.pattern.def;
			}
		}

		Pattern[field] = val;

		const PatternSave = Pattern.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
exports.bsPatternPhotoUpd = async(req, res) => {
	// console.log("/bsPatternPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Pattern = await PatternDB.findOne({_id: obj._id});
		if(!Pattern) return res.redirect("/error?info=没有找到此印花信息");
		const delPhoto = Pattern.photo;
		Pattern.photo = photo;
		const PatternSave = Pattern.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPatterns");
	} catch(error) {
		return res.redirect("/error?info=bsPatternPhotoUpd,Error&error="+error);
	}
}


exports.bsPatternNewAjax = async(req, res) => {
	// console.log("/bsPatternNewAjax");
	try{
		const crUser = req.session.crUser;

		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		if(!code) return res.json({status: 500, message: "请输入印花标识, 请刷新重试"});

		const PatternSame = await PatternDB.findOne({code: code});
		if(PatternSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.code = code;

		const _object = new PatternDB(obj);
		const PatternSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}