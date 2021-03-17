/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');

const PdspuDB = require('../../../../models/product/Pdspu');
const SizeSystDB = require('../../../../models/attr/SizeSyst');

const SizeDB = require('../../../../models/attr/Size');
const ColorDB = require('../../../../models/attr/Color');
const PternDB = require('../../../../models/pattern/Ptern');

const MtrialDB = require('../../../../models/material/Mtrial');

const PdCostMtDB = require('../../../../models/product/PdCostMt');
const PdskuDB = require('../../../../models/product/Pdsku');

exports.bsPdspuSizeUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Sizes = await SizeDB.find({SizeSyst: Pdspu.SizeSyst});

		return res.render("./user/bser/product/Pdspu/update/pdsizesUp", {title: "产品尺寸更新", Pdspu, Sizes, crUser});
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

		let sizeNew = 10;
		if(!Pdspu.sizes || Pdspu.sizes.length == 0) {
			Pdspu.sizes.push(sizeNew);
		} else {
			if(size == "l"){
				const sizel = Pdspu.sizes[0];
				if(sizel <= Conf.SizeNums[0]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				sizeNew = sizel-1;
				Pdspu.sizes.unshift(sizeNew);
				
			} else {
				let sizer = Pdspu.sizes[Pdspu.sizes.length-1];
				if(sizer >= Conf.SizeNums[Conf.SizeNums.length-1]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				sizeNew = sizer+1;
				Pdspu.sizes.push(sizeNew);
			}
		}
		// 在Pdspu下 为每个没有 size值的 PdCostMts 添加一个含有 size = sizeNew 的 PdCostMt;
		const crtObjParam = {Pdspu: id, size: null};
		const crtObj = {size: sizeNew};
		const PdCostMts = await PdCostMtDB.find(crtObjParam);
		for(let i=0; i<PdCostMts.length; i++) {
			const PdCostMt = PdCostMts[i];
			const objPdCostMt = new Object();
			objPdCostMt.Firm = PdCostMt.Firm;
			objPdCostMt.Pdspu = PdCostMt.Pdspu;
			if(crtObj.size) {objPdCostMt.size = crtObj.size; } else{objPdCostMt.size = PdCostMt.size; }
			if(crtObj.Mtrial) {objPdCostMt.Mtrial = crtObj.Mtrial; } else {objPdCostMt.Mtrial = PdCostMt.Mtrial; }
			const PdCostMtSame = await PdCostMtDB.findOne({Pdspu: id, size: objPdCostMt.size, Mtrial: objPdCostMt.Mtrial});
			if(!PdCostMtSame) {
				const _objPdCostMt = new PdCostMtDB(objPdCostMt);
				const PdCostMtSave = await _objPdCostMt.save();
				Pdspu.PdCostMts.push(PdCostMtSave._id);
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

		let sizeDel = "-1";
		if(size == "l"){
			sizeDel = Pdspu.sizes[0];
			Pdspu.sizes.shift();
		} else {
			sizeDel = Pdspu.sizes[Pdspu.sizes.length-1]
			Pdspu.sizes.pop();
		}
		// 删除Pdspu下 PdCostMts中 所有包含 size: sizeDel PdCostMts
		const delObjParam = {Pdspu: id, size: sizeDel};
		const PdCostMts = await PdCostMtDB.find(delObjParam, {_id: 1});
		for(let i=0; i<PdCostMts.length; i++) {
			Pdspu.PdCostMts.remove(PdCostMts[i]._id);
		}
		const PdCostMtsDelMany = await PdCostMtDB.deleteMany(delObjParam);

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
		const Pdspu = await PdspuDB.findOne({_id: id})
			.populate("Colors");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Colors = await ColorDB.find();

		return res.render("./user/bser/product/Pdspu/update/pdColorsUp", {title: "产品颜色更新", Pdspu, Colors, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuColorUpdAjax = async(req, res) => {
	// console.log("/bsPdspuColorUpdAjax");
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const ColorId = req.query.ColorId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm}, {Colors: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});

		const isExist = Pdspu.Colors.includes(ColorId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此颜色, 不可重复添加, 请刷新重试"});
			Pdspu.Colors.unshift(ColorId);
		} else {
			if(isExist == false) return res.json({status: 500, message: "此颜色已被删除, 请刷新查看"});
			Pdspu.Colors.remove(ColorId)
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuColorUpdAjax Error: "+error});
	}
}

exports.bsPdspuPternUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id})
			.populate("Pterns");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Pterns = await PternDB.find();
		return res.render("./user/bser/product/Pdspu/update/pdPternsUp", {title: "产品印花更新", Pdspu, Pterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuPternUpdAjax = async(req, res) => {
	// console.log("/bsPdspuPternUpdAjax");
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const PternId = req.query.PternId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm}, {Pterns: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		const isExist = Pdspu.Pterns.includes(PternId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Pterns.unshift(PternId);
		} else {
			if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});
			Pdspu.Pterns.remove(PternId)
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuPternUpdAjax Error: "+error});
	}
}

exports.bsPdspuMtrialUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id})
			.populate("Mtrials");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Mtrials = await MtrialDB.find();
		return res.render("./user/bser/product/Pdspu/update/pdMtrialsUp", {title: "产品印花更新", Pdspu, Mtrials, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuMtrialUpdAjax = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const MtrialId = req.query.MtrialId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm}, {Mtrials: 1, PdCostMts: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		const isExist = Pdspu.Mtrials.includes(MtrialId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Mtrials.unshift(MtrialId);
			// 在Pdspu下 为每个没有 Mtrial值的 PdCostMts 添加一个含有 Mtrial = MtrialId 的 PdCostMt;
			const crtObjParam = {Pdspu: PdspuId, Mtrial: null};
			const crtObj = {Mtrial: MtrialId};
			const PdCostMts = await PdCostMtDB.find(crtObjParam);
			for(let i=0; i<PdCostMts.length; i++) {
				const PdCostMt = PdCostMts[i];
				const objPdCostMt = new Object();
				objPdCostMt.Firm = PdCostMt.Firm;
				objPdCostMt.Pdspu = PdCostMt.Pdspu;
				if(crtObj.size) {objPdCostMt.size = crtObj.size; } else{objPdCostMt.size = PdCostMt.size; }
				if(crtObj.Mtrial) {objPdCostMt.Mtrial = crtObj.Mtrial; } else {objPdCostMt.Mtrial = PdCostMt.Mtrial; }
				const PdCostMtSame = await PdCostMtDB.findOne({Pdspu: PdspuId, size: objPdCostMt.size, Mtrial: objPdCostMt.Mtrial});
				if(!PdCostMtSame) {
					const _objPdCostMt = new PdCostMtDB(objPdCostMt);
					const PdCostMtSave = await _objPdCostMt.save();
					Pdspu.PdCostMts.push(PdCostMtSave._id);
				}
			}
		} else {
			if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});
			Pdspu.Mtrials.remove(MtrialId)
			// 删除Pdspu下 PdCostMts中 所有包含 Mtrial: MtrialId的 PdCostMts
			const delObjParam = {Pdspu: PdspuId, Mtrial: MtrialId};
			const PdCostMts = await PdCostMtDB.find(delObjParam, {_id: 1});
			for(let i=0; i<PdCostMts.length; i++) {
				Pdspu.PdCostMts.remove(PdCostMts[i]._id);
			}
			const PdCostMtsDelMany = await PdCostMtDB.deleteMany(delObjParam);
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
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

/* 在Pdspu下 为每个没有 Mtrial值的 PdCostMts 添加一个含有 Mtrial = MtrialId 的 PdCostMt; */
// const crtPdCostMtPdspu_FuncProm = async(crtObjParam, crtObj) => {
// 	try {
// 		return new Promise(async(resolve, reject) => {
// 			const newPdCostMts = new Array();
// 			const PdCostMts = await PdCostMtDB.find(crtObjParam);
// 			console.log('s')
// 			for(let i=0; i<PdCostMts.length; i++) {
// 			console.log(i)
// 				const PdCostMt = PdCostMts[i];
// 				const objPdCostMt = new Object();
// 				objPdCostMt.Firm = PdCostMt.Firm;
// 				objPdCostMt.Pdspu = PdCostMt.Pdspu;

// 				if(crtObj.size) {
// 					objPdCostMt.size = crtObj.size;
// 				} else{
// 					objPdCostMt.size = PdCostMt.size;
// 				}
// 				if(crtObj.Mtrial) {
// 					objPdCostMt.Mtrial = crtObj.Mtrial;
// 				} else {
// 					objPdCostMt.Mtrial = PdCostMt.Mtrial;
// 				}
// 				const _objPdCostMt = new PdCostMtDB(objPdCostMt);
// 				const PdCostMtSave = await _objPdCostMt.save();
// 				newPdCostMts.push(PdCostMtSave._id);
// 			}
// 			console.log('e')
// 			resolve(newPdCostMts);
// 		})
// 	} catch(error) {
// 		reject(error);
// 	}
// }

exports.bsPdspuPdCostMtUpdAjax = async(req, res) => {
		// console.log("/bsPdspuPdCostMtUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Color的id
		const PdCostMt = await PdCostMtDB.findOne({'_id': id})
		if(!PdCostMt) return res.json({status: 500, message: "没有找到此颜色信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值
		const type = req.body.type;	// 传输数据的类型
		if(type == "Float") {
			val = parseFloat(val);
			if(isNaN(val) || val<0) return res.json({status: 500, message: "请传递正确的数值"});
		} else {
			// type == "String"
			val = String(val).replace(/^\s*/g,"").toUpperCase();
		}

		const field = req.body.field;

		PdCostMt[field] = val;

		const PdCostMtSave = PdCostMt.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}