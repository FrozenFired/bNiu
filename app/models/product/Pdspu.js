const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdspu';
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

	Mtrails: [{type: ObjectId, ref: 'Mtrail'}],

	/* ------------------ Attr sku ------------------ */
	Patterns: [{type: ObjectId, ref: 'Pattern'}],

	Colors: [{type: ObjectId, ref: 'Color'}],

	SizeStandard: {type: ObjectId, ref: 'SizeStandard'},
	sizes: [{type: Number }],

	Pdskus: [{type: ObjectId, ref: 'Pdsku'}],


	/* ------------------ 价格 ------------------ */
	price: Float,
	cost: Float,





	// status: Number,		// 其他标识
	shelf: Number,		// 上下架
	weight: Number,		// 权重
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.weight) this.weight = 1;
		if(!this.shelf) this.shelf = 1;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);