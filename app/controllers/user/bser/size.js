/*
	[尺寸]数据库 可以任意添加修改删除。
	因为其他数据库存储的尺寸全部为数字 在Conf中有储存
*/
const Conf = require('../../../config/conf.js');
const MdFilter = require('../../../middle/MdFilter');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

const SizeDB = require('../../../models/attr/Size');
const StandardDB = require('../../../models/attr/SizeSyst');

exports.bsSizes = async(req, res) => {
	// console.log("/bsSizes");
	try{
		const crUser = req.session.crUser;
		const sizeNums = Conf.sizeNums;
		const Standards = await StandardDB.find();
		const Sizes = await SizeDB.find();
		return res.render("./user/bser/size/list", {title: "尺寸管理", sizeNums, Standards, Sizes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsSizes,Error&error="+error);
	}
}

exports.bsSizeSystAdd = async(req, res) => {
	// console.log("/bsSizeSystAdd");
	try{
		const crUser = req.session.crUser;
		const Langs = await LangDB.find();
		return res.render("./user/bser/size/addStandard", {title: "添加尺寸新标准", Langs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsSizeSystAdd,Error&error="+error);
	}
}

exports.bsSizeSystNew = async(req, res) => {
	// console.log("/bsSizeSystNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 2) return res.redirect("/error?info=bsSizeSystNew,objCode");
		const StandardSame = await StandardDB.findOne({code: obj.code});
		if(StandardSame) return res.redirect("/error?info=bsSizeSystNew,StandardSame");
		const _object = new StandardDB(obj);
		const SizeSave = await	_object.save();
		return res.redirect("/bsSizes");
	} catch(error) {
		return res.redirect("/error?info=bsSizeSystNew,Error&error="+error);
	}
}

exports.bsSizeSystUpdAjax = async(req, res) => {
	// console.log("/bsSizeSystUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Size的id
		const Standard = await StandardDB.findOne({'_id': id})
		if(!Standard) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		let val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		if(field == "code") {
			if(!val) {
				const StandardRm = await StandardDB.deleteOne({_id: id});
				const SizesRm = await SizeDB.deleteMany({SizeSyst: id});
			} else {
				const StandardSame = await StandardDB.findOne({code: val});
				if(StandardSame) return res.json({status: 500, message: "有相同的编号"});
				Standard[field] = val;
			}
		} else if(field == "weight"){
			val = parseInt(val);
			if(isNaN(val)) val = 1;
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

		const SizeSame = await SizeDB.findOne({SizeSyst: standardId, size: size});
		if(SizeSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.SizeSyst = standardId;
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