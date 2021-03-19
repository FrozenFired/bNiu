/*
	[材料]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const MtFirmDB = require('../../../../models/material/MtFirm');
const MtCategDB = require('../../../../models/material/MtCateg');
const MtrialDB = require('../../../../models/material/Mtrial');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsMtrials = async(req, res) => {
	// console.log("/bsMtrials");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Mtrials = await MtrialDB.find()
			.populate("MtCateg")
			.populate("MtFirm")
			.sort({"weight": -1});
		const MtCategs = await MtCategDB.find({isBottom: 1})
			.populate({path: "MtCategFar", populate: {path: "MtCategFar"}})
			.sort({"weight": -1});
		const MtFirms = await MtFirmDB.find();
		return res.render("./user/bser/material/Mtrial/list", {title: "材料管理", info, MtCategs, MtFirms, Mtrials, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrials,Error&error="+error);
	}
}

exports.bsMtrialAdd = async(req, res) => {
	// console.log("/bsMtrialAdd");
	try{
		const crUser = req.session.crUser;
		const MtCategs = await MtCategDB.find({isBottom: 1})
			.populate({path: "MtCategFar", populate: {path: "MtCategFar"}})
			.sort({"weight": -1});
		const MtFirms = await MtFirmDB.find();
		if(!MtFirms || MtFirms.length < 1) return res.redirect("./error?info=请先添加材料供应商");
		return res.render("./user/bser/material/Mtrial/add", {title: "添加新材料", crUser, MtCategs, MtFirms});
	} catch(error) {
		return res.redirect("/error?info=bsMtrialAdd,Error&error="+error);
	}
}

exports.bsMtrialNew = async(req, res) => {
	// console.log("/bsMtrialNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtrialNew,请输入材质编号");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsMtrialNew,采购价格格式不对, 可以不输入");
		}
		obj.photo = Conf.photo.Mtrial.def;

		const MtrialSame = await MtrialDB.findOne({code: obj.code});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialNew,编号相同");

		if(!obj.MtFirm) return res.redirect("/error?info=bsMtrialNew,请选择供应商");
		const MtFirm = await MtFirmDB.findOne({_id: obj.MtFirm});
		if(!MtFirm) return res.redirect("/error?info=bsMtrialNew,没有此供应商");

		if(obj.MtCateg) {
			const MtCateg = await MtCategDB.findOne({_id: obj.MtCateg});
			if(!MtCateg) return res.redirect("/error?info=bsMtrialNew,没有此分类");
		} else {
			obj.MtCateg = null;
		}

		const _object = new MtrialDB(obj);
		const MtrialSave = await _object.save();
		return res.redirect("/bsMtrials");
	} catch(error) {
		return res.redirect("/error?info=bsMtrialNew,Error&error="+error);
	}
}


exports.bsMtrialUpdAjax = async(req, res) => {
	// console.log("/bsMtrialUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Mtrial的id
		const Mtrial = await MtrialDB.findOne({_id: id})
		if(!Mtrial) return res.json({status: 500, message: "没有找到此材料信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const MtrialSame = await MtrialDB.findOne({code: val});
			if(MtrialSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "photo") {
			val = String(val).replace(/^\s*/g,"");
			if(val != Mtrial[field]) {
				MdFile.delFile(Mtrial[field]);
				if(!val) val = Conf.photo.Mtrial.def;
			}
		} else if(field == "weight") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsMtrialUpdAjax weight] 排序为数字, 请传递正确的参数"});
		} else if(field == "MtFirm") {
			if(val.length != 24) return res.json({status: 500, message: "[bsMtrialUpdAjax weight] 没有找到您选择的供应商"});
			const MtFirm = await MtFirmDB.findOne({_id: val});
			if(!MtFirm) return res.json({status: 500, message: "[bsMtrialUpdAjax weight] 没有找到您选择的供应商"});
		} else if(field == "MtCateg") {
			if(val.length != 24) {
				val=null;
			} else {
				const MtCateg = await MtCategDB.findOne({_id: val});
				if(!MtCateg) val=null;
			}
		} else {
			return res.json({status: 500, message: "[bsMtrialUpdAjax weight] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		Mtrial[field] = val;

		const MtrialSave = Mtrial.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsMtrialDel = async(req, res) => {
	// console.log("/bsMtrialDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const MtrialExist = await MtrialDB.findOne({_id: id});
		if(!MtrialExist) return res.json({status: 500, message: "此材料已经不存在, 请刷新重试"});

		const Pdspu = await PdspuDB.findOne({Mtrials: id});
		if(Pdspu) return res.redirect("/bsMtrials?info=在 ["+Pdspu.code+"] 等产品已经使用此材料, 不可删除。 除非把相应产品删除");

		const MtrialDel = await MtrialDB.deleteOne({_id: id});
		return res.redirect("/bsMtrials");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsMtrialDel,Error&error="+error);
	}
}











exports.bsMtrialPhotoUpd = async(req, res) => {
	// console.log("/bsMtrialPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Mtrial = await MtrialDB.findOne({_id: obj._id});
		if(!Mtrial) return res.redirect("/error?info=没有找到此材料信息");
		const delPhoto = Mtrial.photo;
		Mtrial.photo = photo;
		const MtrialSave = Mtrial.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsMtrials");
	} catch(error) {
		return res.redirect("/error?info=bsMtrialPhotoUpd,Error&error="+error);
	}
}

















exports.bsMtrial = async(req, res) => {
	// console.log("/bsMtrial");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id})
			.populate("MtCateg")
			.populate("MtFirm")
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/material/Mtrial/detail", {title: "材料详情", Mtrial, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrial,Error&error="+error);
	}
}
exports.bsMtrialUp = async(req, res) => {
	// console.log("/bsMtrialUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id});
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");

		const MtCategs = await MtCategDB.find({isBottom: 1})
			.populate({path: "MtCategFar", populate: {path: "MtCategFar"}})
			.sort({"weight": -1});
		const MtFirms = await MtFirmDB.find();
		if(!MtFirms || MtFirms.length < 1) return res.redirect("./error?info=请先添加材料供应商");
		return res.render("./user/bser/material/Mtrial/update", {title: "材料更新", Mtrial, MtCategs, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrialUp,Error&error="+error);
	}
}
exports.bsMtrialUpd = async(req, res) => {
	// console.log("/bsMtrialUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtrialUpd,objCode");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsMtrialUpd,请输入正确采购价, 可以不输入");
		}
		const Mtrial = await MtrialDB.findOne({_id: obj._id});
		if(!Mtrial) return res.redirect("/error?info=bsMtrialUpd,没有找到此材料信息");

		const MtrialSame = await MtrialDB.findOne({_id: {"$ne": obj._id}, code: obj.code});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialUpd,有相同的编号");

		if(!obj.MtFirm) return res.redirect("/error?info=bsMtrialUpd,请选择供应商");
		const MtFirm = await MtFirmDB.findOne({_id: obj.MtFirm});
		if(!MtFirm) return res.redirect("/error?info=bsMtrialUpd,没有此供应商");

		if(obj.MtCateg) {
			const MtCateg = await MtCategDB.findOne({_id: obj.MtCateg});
			if(!MtCateg) return res.redirect("/error?info=bsMtrialUpd,没有此分类");
		} else {
			obj.MtCateg = null;
		}

		const _object = _.extend(Mtrial, obj);
		const MtrialSave = await _object.save();
		return res.redirect("/bsMtrial/"+MtrialSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsMtrialUpd,Error&error="+error);
	}
}