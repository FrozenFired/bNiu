const Conf = require('../../../../config/conf.js');
const _ = require('underscore');

const MtFirmDB = require('../../../../models/material/MtFirm');
const MtrialDB = require('../../../../models/material/Mtrial');

exports.bsMtFirms = async(req, res) => {
	// console.log("/bsMtFirms");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const MtFirms = await MtFirmDB.find().sort({"weight": -1});
		return res.render("./user/bser/material/MtFirm/list", {title: "供货商列表", info, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtFirms,Error&error="+error);
	}
}

exports.bsMtFirmAdd = async(req, res) => {
	// console.log("/bsMtFirmAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/material/MtFirm/add", {title: "添加供货商", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtFirmAdd,Error&error="+error);
	}
}

exports.bsMtFirmNew = async(req, res) => {
	// console.log("/bsMtFirmNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtFirmNew,objCode");
		const MtFirmSame = await MtFirmDB.findOne({code: obj.code});
		if(MtFirmSame) return res.redirect("/error?info=bsMtFirmNew,MtFirmSame");

		const _object = new MtFirmDB(obj);
		const MtFirmSave = await _object.save();
		return res.redirect("/bsMtFirms");
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsMtFirmNew,Error&error="+error);
	}
}
exports.bsMtFirmUpdAjax = async(req, res) => {
	// console.log("/bsMtFirmUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的MtFirm的id
		const MtFirm = await MtFirmDB.findOne({_id: id})
		if(!MtFirm) return res.json({status: 500, message: "没有找到此供货商信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsMtFirmUpdAjax code] 供应商名称不正确"});
			const MtFirmSame = await MtFirmDB.findOne({code: val});
			if(MtFirmSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "weight") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsMtFirmUpdAjax weight] 排序为数字, 请传递正确的参数"});
		}

		MtFirm[field] = val;

		const MtFirmSave = MtFirm.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsMtFirmDel = async(req, res) => {
	// console.log("/bsMtFirmDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const MtFirmExist = await MtFirmDB.findOne({_id: id});
		if(!MtFirmExist) return res.json({status: 500, message: "此颜色已经不存在, 请刷新重试"});

		const Mtrial = await MtrialDB.findOne({MtFirm: id});
		if(Mtrial) return res.redirect("/bsMtFirms?info=在 ["+Mtrial.code+"] 等材料已经使用此供应商, 不可删除。 除非把相应材料删除");

		const MtFirmDel = await MtFirmDB.deleteOne({_id: id});
		return res.redirect("/bsMtFirms");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsMtFirmDel,Error&error="+error);
	}
}