const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Odspu';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	code: String,	// 编号公司唯一
	note: String,	// 订单备注
	/* ------------------ Attr sku ------------------ */
	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Ptern: {type: ObjectId, ref: 'Ptern'},

	Colors: [{type: ObjectId, ref: 'Color'}],	// 从Pdspu中的选择
	sizes: [Number],							// 从Pdspu中的选择

	Odskus: [{type: ObjectId, ref: 'Odsku'}],

	/* ------------------ 价格 ------------------ */
	quan: Number,	// 订货数量
	ship: Number,	// 发货数量
	price: Float,								// 出售时 Pdspu的价格
	cost: Float,

	client: {type: ObjectId, ref: 'User'},		// 客户


	// 录入为0, 确认为5(与pd建立联系)，完成为10
	step: Number,		// 订单状态
	payment: Number,	// 款项状态

	crter: {type: ObjectId, ref: 'User'},		// 销售人员
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.step) this.step = 1;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);