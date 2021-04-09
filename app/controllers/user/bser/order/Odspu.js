const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFilter = require('../../../../middle/MdFilter');

const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

exports.bsOdspus = async(req, res) => {
	// console.log("/bsOdspus");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Odspus = await OdspuDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/order/Odspu/list", {title: "订单列表", info, Odspus, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsOdspus,Error&error="+error);
	}
}

exports.bsOdspusAjax = async(req, res) => {
	// console.log("/bsOdspus");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = OdspusParamFilter(req, crUser);
		const count = await OdspuDB.countDocuments(param);
		const Odspus = await OdspuDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		let Odspu = null;
		if(Odspus.length > 0) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			Odspu = await OdspuDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {Odspu, Odspus, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOdspusAjax Error!"});
	}
}
const OdspusParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
	};
	const filter = {};
	const sortBy = {};

	if(req.query.code) {
		let symbConb = String(req.query.code)
		symbConb = symbConb.replace(/^\s*/g,"").toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		param["code"] = {'$in': symbConb};
	}

	if(req.query.sortKey && req.query.sortVal) {
		let sortKey = req.query.sortKey;
		let sortVal = parseInt(req.query.sortVal);
		if(!isNaN(sortVal) && (sortVal == 1 || sortVal == -1)) {
			sortBy[sortKey] = sortVal;
		}
	}

	sortBy['sort'] = -1;
	sortBy['updAt'] = -1;

	const {page, pagesize, skip} = MdFilter.page_Filter(req);
	return {param, filter, sortBy, page, pagesize, skip};
}





exports.bsOdspuAdd = async(req, res) => {
	// console.log("/bsOdspuAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/order/Odspu/add", {title: "添加新订单", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsOdspuAdd,Error&error="+error);
	}
}

exports.bsOdspuNew = async(req, res) => {
	// console.log("/bsOdspuNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsOdspuNew,objCode");

		const OdspuSame = await OdspuDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(OdspuSame) return res.redirect("/error?info=bsOdspuNew,OdspuSame");

		const _object = new OdspuDB(obj);
		const OdspuSave = await _object.save();
		return res.redirect("/bsOdspus");
	} catch(error) {
		return res.redirect("/error?info=bsOdspuNew,Error&error="+error);
	}
}
exports.bsOdspuUpdAjax = async(req, res) => {
	// console.log("/bsOdspuUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Odspu的id
		const Odspu = await OdspuDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Odspu) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsOdspuUpdAjax code] 订单不正确"});
			const OdspuSame = await OdspuDB.findOne({code: val, Firm: crUser.Firm});
			if(OdspuSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsOdspuUpdAjax sort] 排序为数字, 请传递正确的参数"});
		}

		Odspu[field] = val;

		const OdspuSave = Odspu.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOdspuDel = async(req, res) => {
	// console.log("/bsOdspuDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const OdspuExist = await OdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!OdspuExist) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});

		const Odsku = await OdskuDB.findOne({Odspu: id, Firm: crUser.Firm});
		if(Odsku) return res.redirect("/bsOdspus?info=["+Odsku.code+"] 等产品正在使用此订单, 不可删除。 除非把相应产品删除");

		const OdspuDel = await OdspuDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsOdspus");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOdspuDel,Error&error="+error);
	}
}


exports.bsOdspuNewAjax = async(req, res) => {
	// console.log("/bsOdspuNewAjax");
	try{
		const crUser = req.session.crUser;

		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		if(!code) return res.json({status: 500, message: "请输入订单标识, 请刷新重试"});

		const OdspuSame = await OdspuDB.findOne({code: code, Firm: crUser.Firm});
		if(OdspuSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.code = code;

		const _object = new OdspuDB(obj);
		const OdspuSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}