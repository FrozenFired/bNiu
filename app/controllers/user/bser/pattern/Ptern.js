/*
	[印花 样板]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const _ = require('underscore');

const PternDB = require('../../../../models/pattern/Ptern');

exports.bsPterns = async(req, res) => {
	// console.log("/bsPterns");
	try{
		const crUser = req.session.crUser;
		const Pterns = await PternDB.find().sort({"weight": -1});
		return res.render("./user/bser/pattern/Ptern/list", {title: "印花管理", Pterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPterns,Error&error="+error);
	}
}

exports.bsPternAdd = async(req, res) => {
	// console.log("/bsPternAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/pattern/Ptern/add", {title: "添加新印花", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPternAdd,Error&error="+error);
	}
}

exports.bsPternNew = async(req, res) => {
	// console.log("/bsPternNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPternNew,objCode");
		obj.photo = Conf.photo.Ptern.def;
		const PternSame = await PternDB.findOne({code: obj.code});
		if(PternSame) return res.redirect("/error?info=bsPternNew,PternSame");

		const _object = new PternDB(obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternNew,Error&error="+error);
	}
}
exports.bsPternUpdAjax = async(req, res) => {
	// console.log("/bsPternUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Ptern的id
		const Ptern = await PternDB.findOne({_id: id})
		if(!Ptern) return res.json({status: 500, message: "没有找到此印花信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值
		const type = req.body.type;	// 传输数据的类型
		if(type == "Int") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "updAjax 参数为整数, 请传递正确的参数"});
		} else {
			// type == "String"
			val = String(val).replace(/^\s*/g,"").toUpperCase();
		}

		const isFile = ["photo"];
		const field = req.body.field;
		if(field == "code") {
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PternSame = await PternDB.findOne({code: val});
			if(PternSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(isFile.includes(field) && Ptern[field]) {
			if(val != Ptern[field]) {
				MdFile.delFile(Ptern[field]);
				if(!val) val = Conf.photo.Ptern.def;
			}
		}

		Ptern[field] = val;

		const PternSave = Ptern.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
exports.bsPternPhotoUpd = async(req, res) => {
	// console.log("/bsPternPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Ptern = await PternDB.findOne({_id: obj._id});
		if(!Ptern) return res.redirect("/error?info=没有找到此印花信息");
		const delPhoto = Ptern.photo;
		Ptern.photo = photo;
		const PternSave = Ptern.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternPhotoUpd,Error&error="+error);
	}
}


exports.bsPternNewAjax = async(req, res) => {
	// console.log("/bsPternNewAjax");
	try{
		const crUser = req.session.crUser;

		const code = req.body.code.replace(/^\s*/g,"").toUpperCase();
		if(!code) return res.json({status: 500, message: "请输入印花标识, 请刷新重试"});

		const PternSame = await PternDB.findOne({code: code});
		if(PternSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.code = code;

		const _object = new PternDB(obj);
		const PternSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}