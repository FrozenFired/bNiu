const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'PtCateg';
const dbSchema = new Schema({
	/* ------------------ 创建时 ------------------ */
	code: String,										// 本公司唯一 req
	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String
	}],

	level: Number,										// 分类层级
	PtCategFar: {type: ObjectId, ref: 'PtCateg'},		// req
	PtCategSons: [{type: ObjectId, ref: 'PtCateg'}],
	isBottom: Number,									// 是否是最底层分类 req

	shelf: Number,										// req
	weight: Number,										// req
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.level) this.level = 1;
		if(!this.shelf) this.shelf = 1;
		if(!this.weight) this.weight = 1;
		if(!this.isBottom) this.isBottom = -1;
		if(this.level == 3) this.isBottom = 1;
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);