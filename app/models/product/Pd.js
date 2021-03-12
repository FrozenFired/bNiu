const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pd';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	code: String,	// 编号公司唯一
	PdCateg: {type: ObjectId, ref: 'PdCateg'},	// 种类
	PdNome: {type: ObjectId, ref: 'PdNome'},	// 名称
	photo: String,
	photos: [{type:String}],
	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String,
		desp: String
	}],

	maters: [{
		Mater: {type: ObjectId, ref: 'Mater'},
		value: Number
	}],

	/* ------------------ Attr sku ------------------ */
	Patterns: [{type: ObjectId, ref: 'Pattern'}],

	Colors: [{type: ObjectId, ref: 'Colors'}],

	SizeStandard: {type: ObjectId, ref: 'SizeStandard'},
	sizes: [{
		size: Number,
		maters: [{
			Mater: {type: ObjectId, ref: 'Mater'},
			value: Float
		}],
	}],
	/* ------------------ 库存 ------------------ */
	Pdskus: [{type: ObjectId, ref: 'Pdsku'}],


	/* ------------------ 价格 ------------------ */
	price: Float,





	// shelf: Number,		// 上下架
	// status: Number,		// 其他标识
	// weight: Number,		// 权重
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,

});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.crtAt = this.updAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);