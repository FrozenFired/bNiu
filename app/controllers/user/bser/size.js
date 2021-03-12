const Conf = require('../../../config/conf.js');
const MdFilter = require('../../../middle/mdFilter');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

const SizeDB = require('../../../models/attr/Size');
const StandardDB = require('../../../models/attr/SizeStandard');

exports.bsSizes = async(req, res) => {
	// console.log("/bsSizes");
	try{
		const crUser = req.session.crUser;
		const sizeNums = Conf.sizeNums;
		const Standards = await StandardDB.find();
		const Sizes = await SizeDB.find();
		return res.render("./user/bser/size/list", {title: "尺寸管理", sizeNums, Standards, Sizes});
	} catch(error) {
		return res.redirect("/error?info=bsSizes,Error&error="+error);
	}
}

exports.bsSizeStandardAdd = async(req, res) => {
	// console.log("/bsSizeStandardAdd");
	try{
		const Langs = await LangDB.find();
		return res.render("./user/bser/size/addStandard", {title: "添加尺寸新标准", Langs});
	} catch(error) {
		return res.redirect("/error?info=bsSizeStandardAdd,Error&error="+error);
	}
}

exports.bsSizeStandardNew = async(req, res) => {
	// console.log("/bsSizeStandardNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 2) return res.redirect("/error?info=bsSizeStandardNew,objCode");
		const StandardSame = await StandardDB.findOne({code: obj.code});
		if(StandardSame) return res.redirect("/error?info=bsSizeStandardNew,StandardSame");
		const _object = new StandardDB(obj);
		const SizeSave = await	_object.save();
		return res.redirect("/bsSizes");
	} catch(error) {
		return res.redirect("/error?info=bsSizeStandardNew,Error&error="+error);
	}
}

exports.bsSizeStandardUpdAjax = async(req, res) => {
	// console.log("/bsSizeStandardUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Size的id
		const Standard = await StandardDB.findOne({'_id': id})
		if(!Standard) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		const val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		if(!val) {
			const StandardRm = await StandardDB.deleteOne({_id: id});
			const SizesRm = await SizeDB.deleteMany({SizeStandard: id});
		} else {
			Standard[field] = val;
		}
		const StandardSave = Standard.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsSizeNewAjax = async(req, res) => {
	// console.log("/bsSizeNewAjax");
	try{
		const size = req.body.size;
		const standardId = req.body.standard;
		const symbol = req.body.symbol.replace(/^\s*/g,"").toUpperCase();
		if(!symbol) return res.json({status: 500, message: "请输入尺寸标识, 请刷新重试"});

		const Standard = await StandardDB.findOne({'_id': standardId})
		if(!Standard) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const SizeSame = await SizeDB.findOne({SizeStandard: standardId, size: size});
		if(SizeSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.SizeStandard = standardId;
		obj.size = size;
		obj.symbol = symbol;

		const _object = new SizeDB(obj);
		const SizeSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
exports.bsSizeUpdAjax = async(req, res) => {
	// console.log("/bsSizeUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Size的id
		const Size = await SizeDB.findOne({'_id': id})
		if(!Size) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		const val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		if(!val) {
			const SizeRm = await SizeDB.deleteOne({_id: id});
		} else {
			Size[field] = val;
		}

		const SizeSave = Size.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}