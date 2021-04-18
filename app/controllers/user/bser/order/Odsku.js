const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const moment = require('moment');
const MdFilter = require('../../../../middle/MdFilter');
const FirmDB = require('../../../../models/login/Firm');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsOdskuNewAjax = async(req, res) => {
	// console.log("/bsOdskuNewAjax");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		return;

		const Pdspu = await PdspuDB.findOne({_id : obj.Pdspu});
		if(!Pdspu) res.json({status: 500, message: "bsOdskuNewAjax Pdspu not Exist"});

		const Order = await OrderDB.findOne({_id : obj.Order});
		if(!Order) res.json({status: 500, message: "bsOdskuNewAjax Order not Exist"});
		obj.cter = Order.cter;
		obj.crter = Order.crter;
		obj.Firm = Order.Firm;

		const OdskuSame = await OdskuDB.findOne({Firm: crUser.Firm, Order: Order._id, Pdspu: Pdspu._id});
		if(OdskuSame) return res.json({status: 500, message: "bsOdskuNewAjax OdskuSame"});

		const _object = new OdskuDB(obj);
		const OdskuSave = await _object.save();
		return res.redirect("/bsOdskus");
	} catch(error) {
		return res.json({status: 500, message: "bsOdskuNewAjax Error"});
	}
}

exports.bsOdskuUpdAjax = async(req, res) => {
	// console.log("/bsOdskuNewAjax");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		console.log(obj)
		return;
		const Firm = await FirmDB.findOne({_id: crUser.Firm});
		if(!Firm) return res.json({status: 500, message: "bsOdskuNewAjax Firm not Exist"});

		const Pdspu = await PdspuDB.findOne({_id : obj.Pdspu});
		if(!Pdspu) res.json({status: 500, message: "bsOdskuNewAjax Pdspu not Exist"});

		const Order = await OrderDB.findOne({_id : obj.Order});
		if(!Order) res.json({status: 500, message: "bsOdskuNewAjax Order not Exist"});
		obj.cter = Order.cter;
		obj.crter = Order.crter;
		obj.Firm = Order.Firm;

		const OdskuSame = await OdskuDB.findOne({Firm: crUser.Firm, Order: Order._id, Pdspu: Pdspu._id});
		if(OdskuSame) return res.json({status: 500, message: "bsOdskuNewAjax OdskuSame"});

		const _object = new OdskuDB(obj);
		const OdskuSave = await _object.save();
		return res.redirect("/bsOdskus");
	} catch(error) {
		return res.json({status: 500, message: "bsOdskuNewAjax Error"});
	}
}