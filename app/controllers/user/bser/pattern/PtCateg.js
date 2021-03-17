const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const PtCategDB = require('../../../../models/pattern/PtCateg');
const PternDB = require('../../../../models/pattern/Ptern');

exports.bsPtCategs = async(req, res) => {
	// console.log("/bsPtCategs");
	try{
		const crUser = req.session.crUser;
		const PtCategFirs = await PtCategDB.find({level: 1})
			.populate({
				path: "PtCategSons",
				options: { sort: { weight: -1 }},
				populate: {
					path: "PtCategSons",
					options: { sort: { weight: -1 }}
				}
			})
			.sort({"weight": -1});
		return res.render("./user/bser/pattern/PtCateg/list", {title: "印花分类管理", PtCategFirs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategs,Error&error="+error);
	}
}
exports.bsPtCateg = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id})
			.populate("PtCategFar")
			.populate("PtCategSons")
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/pattern/PtCateg/detail", {title: "印花分类详情", PtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategAdd,Error&error="+error);
	}
}
exports.bsPtCategUp = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id})
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");

		return res.render("./user/bser/pattern/PtCateg/update", {title: "印花分类详情", PtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategAdd,Error&error="+error);
	}
}

exports.bsPtCategAdd = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		let PtCategFar = null;
		if(req.query.PtCategFar) PtCategFar = await PtCategDB.findOne({_id: req.query.PtCategFar});
		return res.render("./user/bser/pattern/PtCateg/add", {title: "添加新印花分类", PtCategFar, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategAdd,Error&error="+error);
	}
}

exports.bsPtCategNew = async(req, res) => {
	// console.log("/bsPtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPtCategNew,objCode");

		const PtCategSame = await PtCategDB.findOne({code: obj.code, PtCategFar: obj.PtCategFar});
		if(PtCategSame) return res.redirect("/error?info=bsPtCategNew,有相同的编号");

		const _object = new PtCategDB(obj);
		let level = 1;
		if(obj.PtCategFar) {
			const PtCategFar = await PtCategDB.findOne({_id: obj.PtCategFar});
			if(!PtCategFar) return res.redirect("/error?info=没有找到父分类");
			if(PtCategFar.level == 3) return res.redirect("/error?info=不可再划分分类");
			level = PtCategFar.level+1;
			PtCategFar.PtCategSons.push(_object._id);
			const PtCategFarSave = await PtCategFar.save();
		}
		_object.level = level;

		const PtCategSave = await _object.save();
		return res.redirect("/bsPtCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPtCategNew,Error&error="+error);
	}
}
/*
	[材质分类]数据库 修改
	改变是否为底层 要作一个判断
		如果有子分类 则不可为底层
		如果本身层级为3 则只能为底层
*/
exports.bsPtCategUpd = async(req, res) => {
	// console.log("/bsPtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPtCategNew,objCode");

		const PtCateg = await PtCategDB.findOne({_id: obj._id});
		if(!PtCateg) return res.redirect("/error?info=bsPtCategNew,不存在此分类");

		const PtCategSame = await PtCategDB.findOne({_id: {"$ne": obj._id}, code: obj.code, PtCategFar: obj.PtCategFar});
		if(PtCategSame) return res.redirect("/error?info=bsPtCategNew,有相同的编号");

		if(obj.isBottom == Conf.isBottom.y.num) {
			if(PtCateg.PtCategSons && PtCateg.PtCategSons.length > 0) return res.redirect("/error?info=bsPtCategNew,有子分类, 不可变为底层");
		}
		else if(obj.isBottom == Conf.isBottom.n.num) {
			if(PtCateg.level == 3) return res.redirect("/error?info=bsPtCategNew,已经是level3底层, 不可变为非底层")
		}

		const _object = _.extend(PtCateg, obj);
		const PtCategSave = await _object.save();
		return res.redirect("/bsPtCateg/"+PtCategSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPtCategNew,Error&error="+error);
	}
}

/*
	[材质分类]数据库 删除
	首先要判断是否有子分类 如果没有则继续删除
	再 把父分类中的此类删除 也要把相应的[材质]数据库中的分类变为不分类
*/
exports.bsPtCategDel = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id})
			.populate("PtCategFar")
			.populate("PtCategSons")
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");

		if(PtCateg.PtCategSons && PtCateg.PtCategSons.length > 0) return res.redirect("/error?info=请先删除子分类");

		if(PtCateg.PtCategFar) {
			const PtCategFar = PtCateg.PtCategFar;
			PtCategFar.PtCategSons.remove(id);
			PtCategFar.save();
		}

		const PternUpdMany = await PternDB.updateMany({PtCateg: id }, {PtCateg: null});

		const PtCategDel = await PtCategDB.deleteOne({_id: id});
		return res.redirect("/bsPtCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPtCategAdd,Error&error="+error);
	}
}