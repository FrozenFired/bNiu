const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Mater';
const dbSchema = new Schema({
	/* ------------------ 创建时 ------------------ */
	MtCateg: {type: ObjectId, ref: 'MtCateg'},

	code: String,	// 类型下唯一

	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String
		desp: String,
	}],
	photo: String,

	weight: Number,
	shelf: Number,
	/* ------------------ 价格 ------------------ */
	price: Float,
	cost: Float,

	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);