/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');

const PdspuDB = require('../../../../models/product/Pdspu');
const SizeStandardDB = require('../../../../models/attr/SizeStandard');

const SizeDB = require('../../../../models/attr/Size');
const ColorDB = require('../../../../models/attr/Color');
const PatternDB = require('../../../../models/attr/Pattern');

const MtrialDB = require('../../../../models/material/Mtrial');

exports.bsPdspuSizeUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Sizes = await SizeDB.find({SizeStandard: Pdspu.SizeStandard});

		return res.render("./user/bser/pdspu/update/sizeUp", {title: "产品尺寸更新", Pdspu, Sizes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuSizeUpdAjax = async(req, res) => {
	// console.log("/bsPdspuSizeUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;
		const size = req.query.size;

		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});

		if(!Pdspu.sizes || Pdspu.sizes.length == 0) {
			Pdspu.sizes.push(10);
		} else {
			if(size == "l"){
				const sizel = Pdspu.sizes[0]
				if(sizel <= Conf.sizeNums[0]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				Pdspu.sizes.unshift(sizel-1);
				
			} else {
				let sizer = Pdspu.sizes[Pdspu.sizes.length-1]
				if(sizer >= Conf.sizeNums[Conf.sizeNums.length-1]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				Pdspu.sizes.push(sizer+1);
			}
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuSizeUpdAjax Error: "+error});
	}
}
exports.bsPdspuSizeDelAjax = async(req, res) => {
	// console.log("/bsPdspuSizeDelAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;
		const size = req.query.size;

		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});
		if(!Pdspu.sizes || Pdspu.sizes.length == 0) return res.json({status: 500, message: "此模特没有尺寸, 请添加"});

		if(size == "l"){
			Pdspu.sizes.shift();
		} else {
			Pdspu.sizes.pop();
		}

		const PdspuSave = await Pdspu.save()
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuSizeDelAjax Error: "+error});
	}
}


exports.bsPdspuColorUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id}).populate("Colors");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Colors = await ColorDB.find();

		return res.render("./user/bser/pdspu/update/colorUp", {title: "产品颜色更新", Pdspu, Colors, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuColorUpdAjax = async(req, res) => {
	// console.log("/bsPdspuColorUpdAjax");
	try {
		const crUser = req.session.crUser;
		const pdspuId = req.query.pdspuId;
		const colorId = req.query.colorId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: pdspuId, firm: crUser.firm}, {Colors: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});

		const isExist = Pdspu.Colors.includes(colorId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此颜色, 不可重复添加, 请刷新重试"});
			Pdspu.Colors.unshift(colorId);
		} else {
			if(isExist == false) return res.json({status: 500, message: "此颜色已被删除, 请刷新查看"});
			Pdspu.Colors.remove(colorId)
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuColorUpdAjax Error: "+error});
	}
}

exports.bsPdspuPatternUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id}).populate("Patterns");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Patterns = await PatternDB.find();
		return res.render("./user/bser/pdspu/update/patternUp", {title: "产品印花更新", Pdspu, Patterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuPatternUpdAjax = async(req, res) => {
	// console.log("/bsPdspuPatternUpdAjax");
	try {
		const crUser = req.session.crUser;
		const pdspuId = req.query.pdspuId;
		const patternId = req.query.patternId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: pdspuId, firm: crUser.firm}, {Patterns: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		const isExist = Pdspu.Patterns.includes(patternId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Patterns.unshift(patternId);
		} else {
			if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});
			Pdspu.Patterns.remove(patternId)
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuPatternUpdAjax Error: "+error});
	}
}

exports.bsPdspuMtrialUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id}).populate("Mtrials");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Mtrials = await MtrialDB.find();
		return res.render("./user/bser/pdspu/update/mtrialUp", {title: "产品印花更新", Pdspu, Mtrials, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuMtrialUpdAjax = async(req, res) => {
	// console.log("/bsPdspuMtrialUpdAjax");
	try {
		const crUser = req.session.crUser;
		const pdspuId = req.query.pdspuId;
		const mtrialId = req.query.mtrialId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: pdspuId, firm: crUser.firm}, {Mtrials: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		const isExist = Pdspu.Mtrials.includes(mtrialId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Mtrials.unshift(mtrialId);
		} else {
			if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});
			Pdspu.Mtrials.remove(mtrialId)
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuMtrialUpdAjax Error: "+error});
	}
}

exports.bsPdSpusPhotosNew = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const id = req.body.id;
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=没有找到此模特, 刷新重试");
		if(!Pdspu.photos) Pdspu.photos = new Array();
		const photos = req.body.files;
		for(let i=0; i<photos.length; i++) {
			Pdspu.photos.push(photos[i]);
		}
		PdspuSave = await Pdspu.save();
		return res.redirect('/bsPdspu/'+id);
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPdSpusPhotosNew Error");
	}
}
exports.bsPdSpusPhotosDel = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const id = req.params.id;
		const photo = req.query.photo;

		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=没有找到此模特, 刷新重试");
		const isExist = Pdspu.photos.includes(photo);
		if(isExist) {
			MdFile.delFile(photo);
			Pdspu.photos.remove(photo);
			const PdspuSave = await Pdspu.save();
		}
		return res.redirect('/bsPdspu/'+id);
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPdspuPostDel Error");
	}
}