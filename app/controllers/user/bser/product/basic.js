/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');

const PdspuDB = require('../../../../models/product/Pdspu');
const PdCategDB = require('../../../../models/product/PdCateg');
const PdNomeDB = require('../../../../models/product/PdNome');
const SizeSystDB = require('../../../../models/attr/SizeSyst');

const SizeDB = require('../../../../models/attr/Size');

const PdCostMtDB = require('../../../../models/product/PdCostMt');
const PdskuDB = require('../../../../models/product/Pdsku');

exports.bsPdspus = async(req, res) => {
	// console.log("/bsPdspus");
	try{
		const crUser = req.session.crUser;
		const Pdspus = await PdspuDB.find().sort({"weight": -1});
		return res.render("./user/bser/product/Pdspu/list", {title: "产品管理", Pdspus, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspus,Error&error="+error);
	}
}

exports.bsPdspuAdd = async(req, res) => {
	// console.log("/bsPdspuAdd");
	try{
		const crUser = req.session.crUser;
		const PdCategs = await PdCategDB.find({isBottom: 1})
			.populate({path: "PdCategFar", populate: {path: "PdCategFar"}})
			.sort({"weight": -1})
		const PdNomes = await PdNomeDB.find().sort({"weight": -1});
		const SizeSysts = await SizeSystDB.find().sort({"weight": -1});
		return res.render("./user/bser/product/Pdspu/add", {title: "添加新产品", PdCategs, PdNomes, SizeSysts, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuAdd,Error&error="+error);
	}
}

exports.bsPdspuNew = async(req, res) => {
	// console.log("/bsPdspuNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		// Pdspu值的初始化
		obj.Firm = crUser.Firm;
		obj.photo = Conf.photo.Pdspu.def;
		// Pdspu值的判断
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 3) return res.redirect("/error?info=bsPdspuNew,编号长度最小为3");
		obj.price = parseFloat(obj.price);
		if(isNaN(obj.price)) return res.redirect("/error?info=bsPdspuNew,请输入正确售价");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsPdspuNew,请输入正确采购价, 可以不输入");
		}
		if(obj.PdCateg) {
			const PdCateg = await PdCategDB.findOne({_id: obj.PdCateg});
			if(!PdCateg) return res.redirect("/error?info=bsPdspuNew,没有此分类");
		} else {
			obj.PdCateg = null;
		}
		if(obj.PdNome) {
			const PdNome = await PdNomeDB.findOne({_id: obj.PdNome});
			if(!PdNome) return res.redirect("/error?info=bsPdspuNew,没有此名称");
		} else {
			obj.PdNome = null;
		}
		const SizeSyst = await SizeSystDB.findOne({_id: obj.SizeSyst});
		if(!SizeSyst) return res.redirect("/error?info=bsPdspuNew,没有此尺寸标准");

		const PdspuSame = await PdspuDB.findOne({code: obj.code});
		if(PdspuSame) return res.redirect("/error?info=bsPdspuNew,PdspuSame");

		const _object = new PdspuDB(obj);
		// 自动添加 PdCostMt
		const objPdCostMt = new Object();
		objPdCostMt.Firm = crUser.Firm;
		objPdCostMt.Pdspu = _object._id;
		const _objPdCostMt = new PdCostMtDB(objPdCostMt);
		_object.PdCostMts.push(_objPdCostMt._id);
		// 自动添加 Pdsku
		const objPdsku = new Object();
		objPdsku.Firm = crUser.Firm;
		objPdsku.Pdspu = _object._id;
		const _objPdsku = new PdskuDB(objPdsku);
		_object.Pdskus.push(_objPdsku._id);

		const PdspuSave = await _object.save();
		const PdCostMtSave = await _objPdCostMt.save();
		const PdskuSave = await _objPdsku.save();

		return res.redirect("/bsPdspus");
	} catch(error) {
		return res.redirect("/error?info=bsPdspuNew,Error&error="+error);
	}
}
exports.bsPdspuUpd = async(req, res) => {
	// console.log("/bsPdspuUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;

		const Pdspu = await PdspuDB.findOne({_id: obj._id});
		if(!Pdspu) return res.redirect("/error?info=bsPdspuUpd,没有找到此材料信息");

		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 3) return res.redirect("/error?info=bsPdspuUpd,objCode");
		obj.price = parseFloat(obj.price);
		if(isNaN(obj.price)) return res.redirect("/error?info=bsPdspuNew,请输入正确售价");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsPdspuUpd,请输入正确采购价, 可以不输入");
		}
		if(obj.PdCateg) {
			const PdCateg = await PdCategDB.findOne({_id: obj.PdCateg});
			if(!PdCateg) return res.redirect("/error?info=bsPdspuUpd,没有此分类");
		} else {
			obj.PdCateg = null;
		}
		if(obj.PdNome) {
			const PdNome = await PdNomeDB.findOne({_id: obj.PdNome});
			if(!PdNome) return res.redirect("/error?info=bsPdspuUpd,没有此名称");
		} else {
			obj.PdNome = null;
		}
		const SizeSyst = await SizeSystDB.findOne({_id: obj.SizeSyst});
		if(!SizeSyst) return res.redirect("/error?info=bsPdspuNew,没有此尺寸标准");

		const PdspuSame = await PdspuDB.findOne({_id: {"$ne": obj._id}, code: obj.code});
		if(PdspuSame) return res.redirect("/error?info=bsPdspuUpd,有相同的编号");

		const _object = _.extend(Pdspu, obj);
		const PdspuSave = await _object.save();
		return res.redirect("/bsPdspu/"+PdspuSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUpd,Error&error="+error);
	}
}
exports.bsPdspuUpdAjax = async(req, res) => {
	// console.log("/bsPdspuUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Pdspu的id
		const Pdspu = await PdspuDB.findOne({_id: id})
		if(!Pdspu) return res.json({status: 500, message: "没有找到此产品信息, 请刷新重试"});

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
			const PdspuSame = await PdspuDB.findOne({code: val});
			if(PdspuSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(isFile.includes(field) && Pdspu[field]) {
			if(val != Pdspu[field]) {
				MdFile.delFile(Pdspu[field]);
				if(!val) val = Conf.photo.Pdspu.def;
			}
		}

		Pdspu[field] = val;

		const PdspuSave = Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		return res.json({status: 500, message: error});
	}
}
exports.bsPdspuPhotoUpd = async(req, res) => {
	// console.log("/bsPdspuPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Pdspu = await PdspuDB.findOne({_id: obj._id});
		if(!Pdspu) return res.redirect("/error?info=没有找到此产品信息");
		const delPhoto = Pdspu.photo;
		Pdspu.photo = photo;
		const PdspuSave = Pdspu.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPdspus");
	} catch(error) {
		return res.redirect("/error?info=bsPdspuPhotoUpd,Error&error="+error);
	}
}


exports.bsPdspu = async(req, res) => {
	// console.log("/bsPdspu");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id})
			.populate("PdCateg")
			.populate("PdNome")
			.populate("Mtrials")
			.populate("SizeSyst")
			.populate("Colors")
			.populate("Pterns")
			.populate("PdCostMts")
			.populate("Pdskus")
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");

		const Sizes = await SizeDB.find({SizeSyst: Pdspu.SizeSyst._id});

		// const PdCostMts = await PdCostMtDB.find({Pdspu: id, Mtrial: null});
		// console.log(PdCostMts)

		return res.render("./user/bser/product/Pdspu/detail", {title: "产品详情", Pdspu, Sizes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspu,Error&error="+error);
	}
}
exports.bsPdspuUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");

		const PdCategs = await PdCategDB.find({isBottom: 1})
			.populate({path: "PdCategFar", populate: {path: "PdCategFar"}})
			.sort({"weight": -1})
		const PdNomes = await PdNomeDB.find().sort({"weight": -1});
		const SizeSysts = await SizeSystDB.find().sort({"weight": -1});
		return res.render("./user/bser/product/Pdspu/update/basicUp", {title: "产品更新", Pdspu, PdCategs, PdNomes, SizeSysts, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
