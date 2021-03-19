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

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsPterns = async(req, res) => {
	// console.log("/bsPterns");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Pterns = await PternDB.find()
			.populate("PtCateg")
			.populate("PtFirm")
			.sort({"weight": -1});
		const PtCategs = await PtCategDB.find({isBottom: 1})
			.populate({path: "PtCategFar", populate: {path: "PtCategFar"}})
			.sort({"weight": -1});
		const PtFirms = await PtFirmDB.find();
		return res.render("./user/bser/pattern/Ptern/list", {title: "印花管理", info, PtCategs, PtFirms, Pterns, crUser});
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
		const PtFirms = await PtFirmDB.find();
		if(!PtFirms || PtFirms.length < 1) return res.redirect("./error?info=请先添加印花厂");
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

		if(!obj.PtFirm) return res.redirect("/error?info=bsPternNew,请选择印花厂");
		const PtFirm = await PtFirmDB.findOne({_id: obj.PtFirm});
		if(!PtFirm) return res.redirect("/error?info=bsPternNew,没有此印花厂");

		if(obj.PtCateg) {
			const PtCateg = await PtCategDB.findOne({_id: obj.PtCateg});
			if(!PtCateg) return res.redirect("/error?info=bsPternNew,没有此分类");
		} else {
			obj.PtCateg = null;
		}

		const _object = new PternDB(obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternNew,Error&error="+error);
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
		} else if(field == "PtFirm") {
			if(val.length != 24) return res.json({status: 500, message: "[bsPternUpdAjax weight] 没有找到您选择的印花厂"});
			const PtFirm = await PtFirmDB.findOne({_id: val});
			if(!PtFirm) return res.json({status: 500, message: "[bsPternUpdAjax weight] 没有找到您选择的印花厂"});
		} else if(field == "PtCateg") {
			if(val.length != 24) {
				val=null;
			} else {
				const PtCateg = await PtCategDB.findOne({_id: val});
				if(!PtCateg) val=null;
			}
		} else {
			return res.json({status: 500, message: "[bsPternUpdAjax weight] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		Ptern[field] = val;

		const PternSave = Ptern.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsPternDel = async(req, res) => {
	// console.log("/bsPternDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const PternExist = await PternDB.findOne({_id: id});
		if(!PternExist) return res.json({status: 500, message: "此印花已经不存在, 请刷新重试"});

		const Pdspu = await PdspuDB.findOne({Pterns: id});
		if(Pdspu) return res.redirect("/bsPterns?info=在 ["+Pdspu.code+"] 等产品已经使用此印花, 不可删除。 除非把相应产品删除");

		const PternDel = await PternDB.deleteOne({_id: id});
		return res.redirect("/bsPterns");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPternDel,Error&error="+error);
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
		const PtFirms = await PtFirmDB.find();
		if(!PtFirms || PtFirms.length < 1) return res.redirect("./error?info=请先添加印花厂");
		return res.render("./user/bser/pattern/Ptern/update", {title: "材料更新", Ptern, PtCategs, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPternUp,Error&error="+error);
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

		if(!obj.PtFirm) return res.redirect("/error?info=bsPtrialUpd,请选择印花厂");
		const PtFirm = await PtFirmDB.findOne({_id: obj.PtFirm});
		if(!PtFirm) return res.redirect("/error?info=bsPtrialUpd,没有此印花厂");

		if(obj.PtCateg) {
			const PtCateg = await PtCategDB.findOne({_id: obj.PtCateg});
			if(!PtCateg) return res.redirect("/error?info=bsPternUpd,没有此分类");
		} else {
			obj.PtCateg = null;
		}

		const _object = _.extend(Ptern, obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPtern/"+PternSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPternUpd,Error&error="+error);
	}
}