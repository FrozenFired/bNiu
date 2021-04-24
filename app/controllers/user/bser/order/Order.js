const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const moment = require('moment');
const MdFilter = require('../../../../middle/MdFilter');
const FirmDB = require('../../../../models/login/Firm');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

exports.bsOrders = async(req, res) => {
	// console.log("/bsOrders");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Orders = await OrderDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/order/Order/list", {title: "订单列表", info, Orders, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsOrders,Error&error="+error);
	}
}

exports.bsOrdersAjax = async(req, res) => {
	// console.log("/bsOrdersAjax");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = OrdersParamFilter(req, crUser);
		const count = await OrderDB.countDocuments(param);
		const objects = await OrderDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await OrderDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOrdersAjax Error!"});
	}
}
const OrdersParamFilter = (req, crUser) => {
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

	sortBy['crtAt'] = -1;

	const {page, pagesize, skip} = MdFilter.page_Filter(req);
	return {param, filter, sortBy, page, pagesize, skip};
}




exports.bsOrderNew = async(req, res) => {
	// console.log("/bsOrderNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.crter = crUser._id;
		obj.Firm = crUser.Firm;
		const Firm = await FirmDB.findOne({_id: crUser.Firm});
		if(!Firm) return res.redirect("/error?info=bsOrderNew,公司信息错误");

		const preOrder = await OrderDB.findOne({Firm : crUser.Firm })
			.sort({'crtAt': -1})
		let code = null;
		if(preOrder) {
			code = preOrder.code;
		}
		obj.code = bsOrderGetCode(code, Firm.code);

		const OrderSame = await OrderDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(OrderSame) return res.redirect("/error?info=bsOrderNew,OrderSame");

		const _object = new OrderDB(obj);
		const OrderSave = await _object.save();
		return res.redirect("/bsOrders");
	} catch(error) {
		return res.redirect("/error?info=bsOrderNew,Error&error="+error);
	}
}
const bsOrderGetCode = (code, FirmCode) => {
	let today =parseInt(moment(Date.now()).format('YYMMDD')) // 计算今天的日期
	let preOrdDay = 0, preOrdNum = 0;

	if(code) {
		const arrs = code.split(FirmCode);
		preOrdDay = arrs[0];
		preOrdNum = arrs[1];
	}

	if(today == preOrdDay) {	// 判断上个订单的日期是否是今天
		preOrdNum = parseInt(preOrdNum)+1
	} else {					// 如果不是则从1开始
		preOrdNum = 1
	}
	for(let len = (preOrdNum + "").length; len < 4; len = preOrdNum.length) { // 序列号补0
		preOrdNum = "0" + preOrdNum;
	}
	
	return String(today) + FirmCode + String(preOrdNum);
}

exports.bsOrder = async(req, res) => {
	// console.log("/bsOrder");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;

		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("cter")
			.populate("crter")
			.populate({
				path: "OdCostMts",
				populate: {path: "Mtrial", populate: {path: "MtFirm", select: "code"}}
			})
		if(!Order) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});

		return res.render("./user/bser/order/Order/detail", {title: "订单详情", Order, crUser});
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOrderDel,Error&error="+error);
	}
}

exports.bsOrderUpdStepAjax = async(req, res) => {
	// console.log("/bsOrderUpdStepAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;		// 所要更改的Order的id
		const cr = parseInt(req.query.cr);
		const nt = parseInt(req.query.nt);

		let Order;
		if(cr == 1) {
			Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
				.populate({
					path: "Odspus", options: { sort: { crtAt: -1 }},
					populate: {
						path: "Odskus", populate: {
							path: "Pdsku", populate: [{
								path: "PdCostMts", match: {Mtrial: {$ne: null}}
							}, {
								path: "Pdspu", select: "code"
							}]
						}
					}
				})
		} else {
			Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
		}
		if(!Order) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		if(cr != Order.step) return res.json({status: 500, message: "当前step值传递错误, 请刷新重试"});

		if(cr == 1 && (nt == 5 || nt == 15 || nt == 20)) {
			Order.startAt = Date.now();
			Order.imp = Order.tot;
			if(nt == 20) {
				Order.finishAt = Date.now();
			}
			const  Odskus = (Order.Odspus[0].Odskus);
			let OdspuLen = OdskuLen = costMtLen = 0;
			const OdCostMts = new Array();
			Order.Odspus.forEach((Odspu) => {
				OdspuLen++;
				Odspu.Odskus.forEach((Odsku) => {
					OdskuLen++;
					Odsku.Pdsku.PdCostMts.forEach((PdCostMt) => {
						if(!PdCostMt.dosage || isNaN(PdCostMt.dosage)) {
							const Pdspu = Odsku.Pdsku.Pdspu;
							return res.json({status: 500, message: Pdspu.code+" 没有填写用量, 请补充"});
						} else {
							costMtLen++;
							let i=0;
							for(; i<OdCostMts.length; i++) {
								if(String(OdCostMts[i].Mtrial) == String(PdCostMt.Mtrial)) {
									OdCostMts[i].dosage += PdCostMt.dosage * Odsku.quan;
									break;
								}
							}
							if(i == OdCostMts.length) {
								const OdCostMt = new Object();
								OdCostMt.Mtrial = PdCostMt.Mtrial;
								OdCostMt.dosage = PdCostMt.dosage * Odsku.quan;
								OdCostMts.push(OdCostMt);
							}
						}
					})
				})
			})
			Order.OdCostMts = OdCostMts;

		} else if(cr == 5 && nt == 15) {

		} else if(cr == 15 && nt == 20) {
			Order.finishAt = Date.now();
		} else if(cr == 20 && nt == 1){
			Order.OdCostMts = [];
		} else {
			return res.json({status: 500, message: "更改step值传递错误, 请刷新重试"});
		}

		Order.step = nt;

		const OdspuUpdMany = await OdspuDB.updateMany({_id: Order.Odspus}, {step: nt});

		const OrderSave = Order.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOrderUpdAjax = async(req, res) => {
	// console.log("/bsOrderUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Order的id
		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Order) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsOrderUpdAjax code] 订单不正确"});
			const OrderSame = await OrderDB.findOne({code: val, Firm: crUser.Firm});
			if(OrderSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsOrderUpdAjax sort] 排序为数字, 请传递正确的参数"});
		}

		Order[field] = val;

		const OrderSave = Order.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOrderDel = async(req, res) => {
	// console.log("/bsOrderDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Order) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});

		
		const OdskusDeleteMany = await OdskuDB.deleteMany({Odspu: {"$in": Order.Odspus}})
		const OdspusDeleteMany = await OdspuDB.deleteMany({_id: {"$in": Order.Odspus}});

		const OrderDel = await OrderDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsOrders");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOrderDel,Error&error="+error);
	}
}