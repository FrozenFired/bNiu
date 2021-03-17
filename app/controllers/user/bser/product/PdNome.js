const Conf = require('../../../../config/conf.js');
const _ = require('underscore');

const PdNomeDB = require('../../../../models/product/PdNome');
const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsPdNomes = async(req, res) => {
	// console.log("/bsPdNomes");
	try{
		const crUser = req.session.crUser;
		const PdNomes = await PdNomeDB.find().sort({"weight": -1});
		return res.render("./user/bser/product/PdNome/list", {title: "名称管理", PdNomes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdNomes,Error&error="+error);
	}
}

exports.bsPdNomeAdd = async(req, res) => {
	// console.log("/bsPdNomeAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/product/PdNome/add", {title: "添加新名称", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdNomeAdd,Error&error="+error);
	}
}

exports.bsPdNomeNew = async(req, res) => {
	// console.log("/bsPdNomeNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPdNomeNew,objCode");
		const PdNomeSame = await PdNomeDB.findOne({code: obj.code});
		if(PdNomeSame) return res.redirect("/error?info=bsPdNomeNew,PdNomeSame");

		const _object = new PdNomeDB(obj);
		const PdNomeSave = await _object.save();
		return res.redirect("/bsPdNomes");
	} catch(error) {
		return res.redirect("/error?info=bsPdNomeNew,Error&error="+error);
	}
}
exports.bsPdNomeUpdAjax = async(req, res) => {
	// console.log("/bsPdNomeUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的PdNome的id
		const PdNome = await PdNomeDB.findOne({_id: id})
		if(!PdNome) return res.json({status: 500, message: "没有找到此名称信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值
		const type = req.body.type;	// 传输数据的类型
		if(type == "Int") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "updAjax 参数为整数, 请传递正确的参数"});
		}
		const field = req.body.field;
		if(field == "code") {
			if(val.length < 1) {
				/*
					[产品名称]数据库 删除
					首先要判断是否有子分类 如果没有则继续删除
					再 把父分类中的此类删除 也要把相应的[材质]数据库中的分类变为不分类
				*/
				const PdspuUpdMany = await PdspuDB.updateMany({PdNome: id }, {PdNome: null});
				const PdNomeDel = await PdNomeDB.deleteOne({_id: id});
				return res.json({status: 200})
			}
			const PdNomeSame = await PdNomeDB.findOne({code: val});
			if(PdNomeSame) return res.json({status: 500, message: "有相同的编号"});
		}

		PdNome[field] = val;

		const PdNomeSave = PdNome.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsPdNomeNewAjax = async(req, res) => {
	// console.log("/bsPdNomeNewAjax");
	try{
		const crUser = req.session.crUser;

		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		if(!code) return res.json({status: 500, message: "请输入名称标识, 请刷新重试"});

		const PdNomeSame = await PdNomeDB.findOne({code: code});
		if(PdNomeSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.code = code;

		const _object = new PdNomeDB(obj);
		const PdNomeSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}