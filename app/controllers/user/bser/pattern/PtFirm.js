const Conf = require('../../../../config/conf.js');
const _ = require('underscore');

const PtFirmDB = require('../../../../models/pattern/PtFirm');
const PternDB = require('../../../../models/pattern/Ptern');

exports.bsPtFirms = async(req, res) => {
	// console.log("/bsPtFirms");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const PtFirms = await PtFirmDB.find().sort({"weight": -1});
		return res.render("./user/bser/pattern/PtFirm/list", {title: "印花厂列表", info, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtFirms,Error&error="+error);
	}
}

exports.bsPtFirmAdd = async(req, res) => {
	// console.log("/bsPtFirmAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/pattern/PtFirm/add", {title: "添加印花厂", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtFirmAdd,Error&error="+error);
	}
}

exports.bsPtFirmNew = async(req, res) => {
	// console.log("/bsPtFirmNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPtFirmNew,objCode");
		const PtFirmSame = await PtFirmDB.findOne({code: obj.code});
		if(PtFirmSame) return res.redirect("/error?info=bsPtFirmNew,PtFirmSame");

		const _object = new PtFirmDB(obj);
		const PtFirmSave = await _object.save();
		return res.redirect("/bsPtFirms");
	} catch(error) {
		return res.redirect("/error?info=bsPtFirmNew,Error&error="+error);
	}
}
exports.bsPtFirmUpdAjax = async(req, res) => {
	// console.log("/bsPtFirmUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的PtFirm的id
		const PtFirm = await PtFirmDB.findOne({_id: id})
		if(!PtFirm) return res.json({status: 500, message: "没有找到此印花厂信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsPtFirmUpdAjax code] 印花厂名称不正确"});
			const PtFirmSame = await PtFirmDB.findOne({code: val});
			if(PtFirmSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "weight") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPtFirmUpdAjax weight] 排序为数字, 请传递正确的参数"});
		}

		PtFirm[field] = val;

		const PtFirmSave = PtFirm.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsPtFirmDel = async(req, res) => {
	// console.log("/bsPtFirmDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const PtFirmExist = await PtFirmDB.findOne({_id: id});
		if(!PtFirmExist) return res.json({status: 500, message: "此印花厂已经不存在, 请刷新重试"});

		const Ptern = await PternDB.findOne({PtFirm: id});
		if(Ptern) return res.redirect("/bsPtFirms?info=存在 ["+Ptern.code+"] 等印花样品, 不可删除。 除非把相应印花删除");

		const PtFirmDel = await PtFirmDB.deleteOne({_id: id});
		return res.redirect("/bsPtFirms");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPtFirmDel,Error&error="+error);
	}
}