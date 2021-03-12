const Conf = require('../../../config/conf.js');
const Stint = require('../../../config/stint.js');
const MdFilter = require('../../../middle/mdFilter');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

const ColorDB = require('../../../models/attr/Color');

exports.bsColors = async(req, res) => {
	// console.log("/bsColors");
	try{
		const crUser = req.session.crUser;
		const Colors = await ColorDB.find().sort({"weight": -1});
		return res.render("./user/bser/color/list", {title: "颜色管理", Colors});
	} catch(error) {
		return res.redirect("/error?info=bsColors,Error&error="+error);
	}
}

exports.bsColorAdd = async(req, res) => {
	// console.log("/bsColorAdd");
	try{
		const colorStint = Stint.extent.color;
		return res.render("./user/bser/color/add", {title: "添加新颜色", colorStint});
	} catch(error) {
		return res.redirect("/error?info=bsColorAdd,Error&error="+error);
	}
}

exports.bsColorNew = async(req, res) => {
	// console.log("/bsColorNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsColorNew,objCode");
		const ColorSame = await ColorDB.findOne({code: obj.code});
		if(ColorSame) return res.redirect("/error?info=bsColorNew,ColorSame");

		const regexp = new RegExp(Stint.extent.color.rgb.regexp);
		if(!regexp.test(obj.rgb) || (obj.rgb.length != Stint.extent.color.rgb.len)) {
			obj.rgb = "FFFFFF";
		}
		const _object = new ColorDB(obj);
		const ColorSave = await	_object.save();
		return res.redirect("/bsColors");
	} catch(error) {
		return res.redirect("/error?info=bsColorNew,Error&error="+error);
	}
}
exports.bsColorUpdAjax = async(req, res) => {
	// console.log("/bsColorUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Color的id
		const Color = await ColorDB.findOne({'_id': id})
		if(!Color) return res.json({status: 500, message: "没有找到此颜色信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值
		const type = req.body.type;	// 传输数据的类型
		if(type == "Int") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "updAjax 参数为整数, 请传递正确的参数"});
		} else {
			// type == "String"
			val = String(val).replace(/^\s*/g,"").toUpperCase();
		}

		const field = req.body.field;
		if(field == "code") {
			if(val.length < 1) return res.json({status: 500, message: "bsColorUpdAjax Code Error"});
		} else if(field == "rgb") {
			const regexp = new RegExp(Stint.extent.color.rgb.regexp);
			if(!regexp.test(val) || (val.length != Stint.extent.color.rgb.len)) {
				return res.json({status: 500, message: "bsColorUpdAjax RGB Error"});
			}
		}
		Color[field] = val;

		const ColorSave = Color.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsColorNewAjax = async(req, res) => {
	// console.log("/bsColorNewAjax");
	try{
		const crUser = req.session.crUser;

		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		if(!code) return res.json({status: 500, message: "请输入颜色标识, 请刷新重试"});

		const ColorSame = await ColorDB.findOne({code: code});
		if(ColorSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.code = code;

		const _object = new ColorDB(obj);
		const ColorSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}