/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');

const PdspuDB = require('../../../../models/product/Pdspu');
const SizeStandardDB = require('../../../../models/attr/SizeStandard');

const SizeDB = require('../../../../models/attr/Size');
const ColorDB = require('../../../../models/attr/Color');
const PatternDB = require('../../../../models/attr/Pattern');

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
		if(!Pdspu.sizes || Pdspu.sizes.length == 0) res.json({status: 500, message: "此模特没有尺寸, 请添加"});

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
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Colors = await ColorDB.find();

		return res.render("./user/bser/pdspu/update/colorUp", {title: "产品颜色更新", Pdspu, Colors, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuColorUpdAjax = async(req, res) => {
	let crUser = req.session.crUser;
	let id = req.query.id;
	let colorId = req.query.colorId;
	let sym = parseInt(req.query.sym);
	Pdfir.findOne({_id: id, firm: crUser.firm}, {colors: 1})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bser AjaxDelColor, pdfir findOne, Error！";
			res.json({success: 0, info: info})
		} else if(!pdfir) {
			info = "没有找到此模特";
			res.json({success: 0, info: info})
		} else {
			// console.log(pdfir)
			if(sym == 0) {
				var i=0
				for(; i<pdfir.colors.length; i++) {
					if(colorId == pdfir.colors[i]) break;
				}
				if(i == pdfir.colors.length) {
					info = "请刷新重试";
					res.json({success: 0, info: info})
				} else {
					pdfir.colors.remove(colorId)

					pdfir.save(function(err, pdSave) {
						if(err) {
							console.log(err);
							info = "bser AjaxDelColor, pdfir save, Error！";
							res.json({success: 0, info: info})
						} else {
							res.json({success: 1, sym})
						}
					})
				}
			} else if(sym == 1) {
				var i=0
				for(; i<pdfir.colors.length; i++) {
					if(colorId == pdfir.colors[i]) break;
				}
				if(i != pdfir.colors.length) {
					info = "不能添加相同颜色";
					res.json({success: 0, info: info})
				} else {
					pdfir.colors.unshift(colorId);
					pdfir.save(function(err, pdSave) {
						if(err) {
							console.log(err);
							info = "bser AjaxNewColor, pdfir save, Error！";
							res.json({success: 0, info: info})
						} else {
							res.json({success: 1, sym})
						}
					})
				}
			} else {
				info = "操作错误";
				res.json({success: 0, info: info})
			}
		}
	})
}

exports.bsPdspuPatternUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Patterns = await PatternDB.find();
		return res.render("./user/bser/pdspu/update/patternUp", {title: "产品印花更新", Pdspu, Patterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}