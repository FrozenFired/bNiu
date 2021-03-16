const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const PdCategDB = require('../../../../models/product/PdCateg');
const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsPdCategs = async(req, res) => {
	// console.log("/bsPdCategs");
	try{
		const crUser = req.session.crUser;
		const PdCategFirs = await PdCategDB.find({level: 1})
		.populate({
			path: "PdCategSons",
			options: { sort: { weight: -1 }},
			populate: {
				path: "PdCategSons",
				options: { sort: { weight: -1 }}
			}
		})
		.sort({"weight": -1})
		return res.render("./user/bser/product/PdCateg/list", {title: "产品分类管理", PdCategFirs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategs,Error&error="+error);
	}
}
exports.bsPdCateg = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id})
		.populate("PdCategFar")
		.populate("PdCategSons")
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/product/PdCateg/detail", {title: "产品分类详情", PdCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}
exports.bsPdCategUp = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id})
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");

		return res.render("./user/bser/product/PdCateg/update", {title: "产品分类详情", PdCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}

exports.bsPdCategAdd = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		let PdCategFar = null;
		if(req.query.PdCategFar) PdCategFar = await PdCategDB.findOne({_id: req.query.PdCategFar});
		return res.render("./user/bser/product/PdCateg/add", {title: "添加新产品分类", PdCategFar, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}

exports.bsPdCategNew = async(req, res) => {
	// console.log("/bsPdCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPdCategNew,objCode");

		const PdCategSame = await PdCategDB.findOne({code: obj.code, PdCategFar: obj.PdCategFar});
		if(PdCategSame) return res.redirect("/error?info=bsPdCategNew,有相同的编号");

		const _object = new PdCategDB(obj);
		let level = 1;
		if(obj.PdCategFar) {
			const PdCategFar = await PdCategDB.findOne({_id: obj.PdCategFar});
			if(!PdCategFar) return res.redirect("/error?info=没有找到父分类");
			if(PdCategFar.level == 3) return res.redirect("/error?info=不可再划分分类");
			level = PdCategFar.level+1;
			PdCategFar.PdCategSons.push(_object._id);
			const PdCategFarSave = await PdCategFar.save();
		}
		_object.level = level;

		const PdCategSave = await _object.save();
		return res.redirect("/bsPdCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPdCategNew,Error&error="+error);
	}
}
/*
	[材质分类]数据库 修改
	改变是否为底层 要作一个判断
		如果有子分类 则不可为底层
		如果本身层级为3 则只能为底层
*/
exports.bsPdCategUpd = async(req, res) => {
	// console.log("/bsPdCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPdCategNew,objCode");

		const PdCateg = await PdCategDB.findOne({_id: obj._id});
		if(!PdCateg) return res.redirect("/error?info=bsPdCategNew,不存在此分类");

		const PdCategSame = await PdCategDB.findOne({_id: {"$ne": obj._id}, code: obj.code, PdCategFar: obj.PdCategFar});
		if(PdCategSame) return res.redirect("/error?info=bsPdCategNew,有相同的编号");

		if(obj.isBottom == Conf.isBottom.y.num) {
			if(PdCateg.PdCategSons && PdCateg.PdCategSons.length > 0) return res.redirect("/error?info=bsPdCategNew,有子分类, 不可变为底层");
		}
		else if(obj.isBottom == Conf.isBottom.n.num) {
			if(PdCateg.level == 3) return res.redirect("/error?info=bsPdCategNew,已经是level3底层, 不可变为非底层")
		}

		const _object = _.extend(PdCateg, obj);
		const PdCategSave = await _object.save();
		return res.redirect("/bsPdCateg/"+PdCategSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPdCategNew,Error&error="+error);
	}
}

/*
	[材质分类]数据库 删除
	首先要判断是否有子分类 如果没有则继续删除
	再 把父分类中的此类删除 也要把相应的[材质]数据库中的分类变为不分类
*/
exports.bsPdCategDel = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id})
		.populate("PdCategFar")
		.populate("PdCategSons")
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");

		if(PdCateg.PdCategSons && PdCateg.PdCategSons.length > 0) return res.redirect("/error?info=请先删除子分类");

		if(PdCateg.PdCategFar) {
			const PdCategFar = PdCateg.PdCategFar;
			PdCategFar.PdCategSons.remove(id);
			PdCategFar.save();
		}

		PdspuDB.updateMany({PdCateg: id }, {PdCateg: null});

		const PdCategRm = await PdCategDB.deleteOne({_id: id});
		return res.redirect("/bsPdCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}