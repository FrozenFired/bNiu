/*
	[印花 样板]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const PtFirmDB = require('../../../../models/pattern/PtFirm');
const PtCategDB = require('../../../../models/pattern/PtCateg');
const PternDB = require('../../../../models/pattern/Ptern');

exports.bsPterns = async(req, res) => {
	// console.log("/bsPterns");
	try{
		const crUser = req.session.crUser;
		const Pterns = await PternDB.find()
			.populate("PtCateg")
			.populate("PtFirm")
			.sort({"weight": -1});
		return res.render("./user/bser/pattern/Ptern/list", {title: "印花管理", Pterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPterns,Error&error="+error);
	}
}

exports.bsPternAdd = async(req, res) => {
	// console.log("/bsPternAdd");
	try{
		const crUser = req.session.crUser;
		const PtCategs = await PtCategDB.find({isBottom: 1})
			.populate({path: "PtCategFar", populate: {path: "PtCategFar"}})
			.sort({"weight": -1});
		const PtFirms = await PtFirmDB.find({})
		return res.render("./user/bser/pattern/Ptern/add", {title: "添加新印花", crUser, PtCategs, PtFirms});
	} catch(error) {
		return res.redirect("/error?info=bsPternAdd,Error&error="+error);
	}
}

exports.bsPternNew = async(req, res) => {
	// console.log("/bsPternNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPternNew,objCode");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsPternNew,采购价格格式不对, 可以不输入");
		}
		obj.photo = Conf.photo.Ptern.def;

		const PternSame = await PternDB.findOne({code: obj.code});
		if(PternSame) return res.redirect("/error?info=bsPternNew,PternSame");

		if(obj.PtCateg) {
			const PtCateg = await PtCategDB.findOne({_id: obj.PtCateg});
			if(!PtCateg) return res.redirect("/error?info=bsPternNew,没有此分类");
		} else {
			obj.PtCateg = null;
		}
		if(obj.PtFirm) {
			const PtFirm = await PtFirmDB.findOne({_id: obj.PtFirm});
			if(!PtFirm) return res.redirect("/error?info=bsPternNew,没有此分类");
		} else {
			obj.PtFirm = null;
		}

		const _object = new PternDB(obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternNew,Error&error="+error);
	}
}
exports.bsPternUpd = async(req, res) => {
	// console.log("/bsPternUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPternUpd,objCode");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsPternUpd,请输入正确采购价, 可以不输入");
		}
		const Ptern = await PternDB.findOne({_id: obj._id});
		if(!Ptern) return res.redirect("/error?info=bsPternUpd,没有找到此材料信息");

		const PternSame = await PternDB.findOne({_id: {"$ne": obj._id}, code: obj.code});
		if(PternSame) return res.redirect("/error?info=bsPternUpd,有相同的编号");

		if(obj.PtCateg) {
			const PtCateg = await PtCategDB.findOne({_id: obj.PtCateg});
			if(!PtCateg) return res.redirect("/error?info=bsPternUpd,没有此分类");
		} else {
			obj.PtCateg = null;
		}
		if(obj.PtFirm) {
			const PtFirm = await PtFirmDB.findOne({_id: obj.PtFirm});
			if(!PtFirm) return res.redirect("/error?info=bsPternNew,没有此分类");
		} else {
			obj.PtFirm = null;
		}

		const _object = _.extend(Ptern, obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPtern/"+PternSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPternUpd,Error&error="+error);
	}
}

exports.bsPternUpdAjax = async(req, res) => {
	// console.log("/bsPternUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Ptern的id
		const Ptern = await PternDB.findOne({_id: id})
		if(!Ptern) return res.json({status: 500, message: "没有找到此印花信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PternSame = await PternDB.findOne({code: val});
			if(PternSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "photo") {
			val = String(val).replace(/^\s*/g,"");
			if(val != Ptern[field]) {
				MdFile.delFile(Ptern[field]);
				if(!val) val = Conf.photo.Ptern.def;
			}
		} else if(field == "weight") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPternUpdAjax weight] 排序为数字, 请传递正确的参数"});
		}

		Ptern[field] = val;

		const PternSave = Ptern.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
exports.bsPternPhotoUpd = async(req, res) => {
	// console.log("/bsPternPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Ptern = await PternDB.findOne({_id: obj._id});
		if(!Ptern) return res.redirect("/error?info=没有找到此印花信息");
		const delPhoto = Ptern.photo;
		Ptern.photo = photo;
		const PternSave = Ptern.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternPhotoUpd,Error&error="+error);
	}
}

exports.bsPtern = async(req, res) => {
	// console.log("/bsPtern");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Ptern = await PternDB.findOne({_id: id})
			.populate("PtCateg")
			.populate("PtFirm")
		if(!Ptern) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/pattern/Ptern/detail", {title: "材料详情", Ptern, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtern,Error&error="+error);
	}
}
exports.bsPternUp = async(req, res) => {
	// console.log("/bsPternUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Ptern = await PternDB.findOne({_id: id});
		if(!Ptern) return res.redirect("/error?info=不存在此分类");

		const PtCategs = await PtCategDB.find({isBottom: 1})
			.populate({path: "PtCategFar", populate: {path: "PtCategFar"}})
			.sort({"weight": -1});
		const PtFirms = await PtFirmDB.find({});
		return res.render("./user/bser/pattern/Ptern/update", {title: "材料更新", Ptern, PtCategs, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPternUp,Error&error="+error);
	}
}