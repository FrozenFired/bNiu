const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const MtCategDB = require('../../../../models/material/MtCateg');
const MtrialDB = require('../../../../models/material/Mtrial');

exports.bsMtCategs = async(req, res) => {
	// console.log("/bsMtCategs");
	try{
		const crUser = req.session.crUser;
		const MtCategFirs = await MtCategDB.find({level: 1})
			.populate({
				path: "MtCategSons",
				options: { sort: { weight: -1 }},
				populate: {
					path: "MtCategSons",
					options: { sort: { weight: -1 }}
				}
			})
			.sort({"weight": -1})
		return res.render("./user/bser/material/MtCateg/list", {title: "材料分类管理", MtCategFirs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtCategs,Error&error="+error);
	}
}
exports.bsMtCateg = async(req, res) => {
	// console.log("/bsMtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const MtCateg = await MtCategDB.findOne({_id: id})
			.populate("MtCategFar")
			.populate("MtCategSons")
		if(!MtCateg) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/material/MtCateg/detail", {title: "材料分类详情", MtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtCategAdd,Error&error="+error);
	}
}
exports.bsMtCategUp = async(req, res) => {
	// console.log("/bsMtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const MtCateg = await MtCategDB.findOne({_id: id})
		if(!MtCateg) return res.redirect("/error?info=不存在此分类");

		return res.render("./user/bser/material/MtCateg/update", {title: "材料分类详情", MtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtCategAdd,Error&error="+error);
	}
}

exports.bsMtCategAdd = async(req, res) => {
	// console.log("/bsMtCategAdd");
	try{
		const crUser = req.session.crUser;
		let MtCategFar = null;
		if(req.query.MtCategFar) MtCategFar = await MtCategDB.findOne({_id: req.query.MtCategFar});
		return res.render("./user/bser/material/MtCateg/add", {title: "添加新材料分类", MtCategFar, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtCategAdd,Error&error="+error);
	}
}

exports.bsMtCategNew = async(req, res) => {
	// console.log("/bsMtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtCategNew,objCode");

		const MtCategSame = await MtCategDB.findOne({code: obj.code, MtCategFar: obj.MtCategFar});
		if(MtCategSame) return res.redirect("/error?info=bsMtCategNew,有相同的编号");

		const _object = new MtCategDB(obj);
		let level = 1;
		if(obj.MtCategFar) {
			const MtCategFar = await MtCategDB.findOne({_id: obj.MtCategFar});
			if(!MtCategFar) return res.redirect("/error?info=没有找到父分类");
			if(MtCategFar.level == 3) return res.redirect("/error?info=不可再划分分类");
			level = MtCategFar.level+1;
			MtCategFar.MtCategSons.push(_object._id);
			const MtCategFarSave = await MtCategFar.save();
		}
		_object.level = level;

		const MtCategSave = await _object.save();
		return res.redirect("/bsMtCategs");
	} catch(error) {
		return res.redirect("/error?info=bsMtCategNew,Error&error="+error);
	}
}
/*
	[材质分类]数据库 修改
	改变是否为底层 要作一个判断
		如果有子分类 则不可为底层
		如果本身层级为3 则只能为底层
*/
exports.bsMtCategUpd = async(req, res) => {
	// console.log("/bsMtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtCategNew,objCode");

		const MtCateg = await MtCategDB.findOne({_id: obj._id});
		if(!MtCateg) return res.redirect("/error?info=bsMtCategNew,不存在此分类");

		const MtCategSame = await MtCategDB.findOne({_id: {"$ne": obj._id}, code: obj.code, MtCategFar: obj.MtCategFar});
		if(MtCategSame) return res.redirect("/error?info=bsMtCategNew,有相同的编号");

		if(obj.isBottom == Conf.isBottom.y.num) {
			if(MtCateg.MtCategSons && MtCateg.MtCategSons.length > 0) return res.redirect("/error?info=bsMtCategNew,有子分类, 不可变为底层");
		}
		else if(obj.isBottom == Conf.isBottom.n.num) {
			if(MtCateg.level == 3) return res.redirect("/error?info=bsMtCategNew,已经是level3底层, 不可变为非底层")
		}

		const _object = _.extend(MtCateg, obj);
		const MtCategSave = await _object.save();
		return res.redirect("/bsMtCateg/"+MtCategSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsMtCategNew,Error&error="+error);
	}
}

/*
	[材质分类]数据库 删除
	首先要判断是否有子分类 如果没有则继续删除
	再 把父分类中的此类删除 也要把相应的[材质]数据库中的分类变为不分类
*/
exports.bsMtCategDel = async(req, res) => {
	// console.log("/bsMtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const MtCateg = await MtCategDB.findOne({_id: id})
			.populate("MtCategFar")
			.populate("MtCategSons")
		if(!MtCateg) return res.redirect("/error?info=不存在此分类");

		if(MtCateg.MtCategSons && MtCateg.MtCategSons.length > 0) return res.redirect("/error?info=请先删除子分类");

		if(MtCateg.MtCategFar) {
			const MtCategFar = MtCateg.MtCategFar;
			MtCategFar.MtCategSons.remove(id);
			MtCategFar.save();
		}

		const MtrialUpdMany = await MtrialDB.updateMany({MtCateg: id }, {MtCateg: null});

		const MtCategDel = await MtCategDB.deleteOne({_id: id});
		return res.redirect("/bsMtCategs");
	} catch(error) {
		return res.redirect("/error?info=bsMtCategAdd,Error&error="+error);
	}
}