const Conf = require('../../config/conf.js');
const MdFilter = require('../../middle/MdFilter');
const _ = require('underscore');

const UserDB = require('../../models/login/User');
const FirmDB = require('../../models/login/Firm');

exports.adUsers = async(req, res) => {
	// console.log("/adUsers");
	try{
		const crAder = req.session.crAder;
		const Users = await UserDB.find()
		.populate('Firm')
		.sort({'shelf': -1, 'Firm': 1, 'role': 1})
		return res.render('./ader/user/list', {title: '用户列表', crAder, Users });
	} catch(error) {
		return res.redirect('/error?info=adUsers,Error&error='+error);
	}
}

exports.adUserAdd = async(req, res) => {
	// console.log('/adUserAdd');
	try{
		const crAder = req.session.crAder;
		const Firms = await FirmDB.find();
		if(!Firms || Firms.length == 0) return res.redirect('/error?info=请先添加公司');
		return res.render('./ader/user/add', {title: 'Add 用户', crAder, Firms});
	} catch(error) {
		return res.redirect('/error?info=adUserAdd,Error&error='+error);
	}
}

exports.adUserNew = async(req, res) => {
	// console.log('/adUserNew');
	try{
		const obj = req.body.obj;
		obj.code = await MdFilter.userCode_FilterProm(obj.code);
		obj.pwd = await MdFilter.userPwdBcrypt_FilterProm(obj.pwd);
		const Firm = await FirmDB.findOne({'_id': obj.Firm});
		if(!Firm) return res.redirect('/error?info=adUserNew,没有找到此公司,请重新选择');
		if(!Conf.roleNums.includes(parseInt(obj.role))) return res.redirect('/error?info=adUserNew,用户角色参数错误');
		
		// const userSame = await UserDB.findOne({'code': obj.code, Firm: obj.Firm });
		const userSame = await UserDB.findOne({'code': obj.code});
		if(userSame) return res.redirect('/error?info=adUserNew,已有此账号，请重新注册');

		const _object = new UserDB(obj);
		const userSave = await _object.save();
		return res.redirect('/adUsers');
	} catch(error) {
		return res.redirect('/error?info=adUserNew,Error&error='+error);
	}
}

exports.adUserUpdInfo = async(req, res) => {
	// console.log('/adUserUpdInfo');
	try{
		const obj = req.body.obj;
		if(obj.code) return res.redirect('/error?info=adUserUpdInfo,不允许有账户参数');
		if(obj.pwd) return res.redirect('/error?info=adUserUpdInfo,不允许有密码参数');
		if(obj.Firm) return res.redirect('/error?info=adUserUpdInfo,不允许有公司参数');
		if(!Conf.roleNums.includes(parseInt(obj.role))) return res.redirect('/error?info=adUserUpdInfo,用户角色参数错误');
		
		const user = await UserDB.findOne({'_id': obj._id});
		if(!user) return res.redirect('/error?info=adUserUpdInfo,没有找到此用户');
		
		const _object = _.extend(user, obj);
		const userSave = await _object.save();
		return res.redirect("/adUser/"+userSave._id);
	} catch(error) {
		return res.redirect('/error?info=adUserUpdInfo,Error&error='+error);
	}
}
exports.adUserUpdPwd = async(req, res) => {
	// console.log('/adUserUpdPwd');
	try{
		const obj = req.body.obj;
		const user = await UserDB.findOne({'_id': obj._id});
		if(!user) return res.redirect('/error?info=adUserUpdPwd,没有找到此用户');
		
		user.pwd = await MdFilter.userPwdBcrypt_FilterProm(obj.pwd);
		const userSave = await user.save();
		return res.redirect("/adUser/"+userSave._id);
	} catch(error) {
		return res.redirect('/error?info=adUserUpdPwd,Error&error='+error);
	}
}
exports.adUserUpdCode = async(req, res) => {
	// console.log('/adUserUpdCode');
	try{
		const obj = req.body.obj;
		const user = await UserDB.findOne({'_id': obj._id});
		if(!user) return res.redirect('/error?info=adUserUpdCode,没有找到此用户');
		
		code = await MdFilter.userCode_FilterProm(obj.code);
		// const userSame = await UserDB.findOne({'code': code, Firm: user.Firm})
		const userSame = await UserDB.findOne({'code': code}).where('_id').ne(user._id);
		if(userSame) return res.redirect('/error?info=adUserUpdCode,已有此账号');

		user.code = code;
		const userSave = await user.save();
		return res.redirect("/adUser/"+userSave._id);
	} catch(error) {
		return res.redirect('/error?info=adUserUpdCode,Error&error='+error);
	}
}

exports.adUser = async(req, res) => {
	// console.log('/adUser');
	try{
		const crAder = req.session.crAder;
		const id = req.params.id;
		const User = await UserDB.findOne({'_id': id}).populate('Firm', 'code nome');
		if(!User) return res.redirect('/error?info=adUser,没有找到此账号');
		return res.render('./ader/user/detail', {title: '用户详情', crAder, User});
	} catch(error) {
		return res.redirect('/error?info=adUser,Error&error='+error);
	}
}
exports.adUserDel = async(req, res) => {
	// console.log('/adUserDel');
	try{
		const id = req.params.id;
		const userDel = await UserDB.deleteOne({'_id': id});
		return res.redirect("/adUsers");
	} catch(error) {
		return res.redirect('/error?info=adUserDel,Error&error='+error);
	}
}