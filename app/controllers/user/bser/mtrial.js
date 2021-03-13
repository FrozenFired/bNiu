/*
	[材料]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../config/conf.js');
const MdFile = require('../../../middle/MdFile');
const _ = require('underscore');

const MtCategDB = require('../../../models/material/MtCateg');
const MtrialDB = require('../../../models/material/Mtrial');

exports.bsMtrials = async(req, res) => {
	// console.log("/bsMtrials");
	try{
		const crUser = req.session.crUser;
		const Mtrials = await MtrialDB.find()
		.populate("MtCateg")
		.sort({"weight": -1});
		return res.render("./user/bser/mtrial/list", {title: "材料管理", Mtrials, crUser});
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
		return res.render("./user/bser/mtrial/add", {title: "添加新材料", crUser, MtCategs});
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
		obj.photo = Conf.photo.mtrial.def;

		const MtrialSame = await MtrialDB.findOne({code: obj.code});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialNew,编号相同");

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
exports.bsMtrialUpd = async(req, res) => {
	// console.log("/bsMtrialUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtrialUpd,objCode");
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return res.redirect("/error?info=bsMtrialUpd,采购价格格式不对, 可以不输入");
		}
		const Mtrial = await MtrialDB.findOne({_id: obj._id});
		if(!Mtrial) return res.redirect("/error?info=bsMtrialUpd,没有找到此材料信息");

		const MtrialSame = await MtrialDB.findOne({_id: {"$ne": obj._id}, code: obj.code});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialUpd,有相同的编号");

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

exports.bsMtrialUpdAjax = async(req, res) => {
	// console.log("/bsMtrialUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Mtrial的id
		const Mtrial = await MtrialDB.findOne({_id: id})
		if(!Mtrial) return res.json({status: 500, message: "没有找到此材料信息, 请刷新重试"});

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
			const MtrialSame = await MtrialDB.findOne({code: val});
			if(MtrialSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(isFile.includes(field) && Mtrial[field]) {
			if(val != Mtrial[field]) {
				MdFile.delFile(Mtrial[field]);
				if(!val) val = Conf.photo.mtrial.def;
			}
		}

		Mtrial[field] = val;

		const MtrialSave = Mtrial.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
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
	// console.log("/bsMtrialAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id})
		.populate("MtCateg")
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/mtrial/detail", {title: "材料分类详情", Mtrial, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrialAdd,Error&error="+error);
	}
}
exports.bsMtrialUp = async(req, res) => {
	// console.log("/bsMtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id});
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");

		const MtCategs = await MtCategDB.find({isBottom: 1})
		.populate({path: "MtCategFar", populate: {path: "MtCategFar"}})
		.sort({"weight": -1});

		return res.render("./user/bser/mtrial/update", {title: "材料分类详情", Mtrial, MtCategs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtCategAdd,Error&error="+error);
	}
}