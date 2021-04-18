const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Order';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	code: String,	// 编号公司唯一
	note: String,	// 订单备注
	/* ------------------ Attr sku ------------------ */
	Odspus: [{type: ObjectId, ref: 'Odspu'}],

	/* ------------------ 价格 ------------------ */
	quan: Number,	// 订货数量
	ship: Number,	// 发货数量

	price: Float, 					// 订单价格
	imp: Float,						// 应收价格
	paid: Float,					// 实际收款

	// 录入为1, 提交为5 审核确认为15 完成为20
	step: Number,					// 订单状态
	payment: Number,				// 款项状态

	categ: Number,		// 订单类型->  1.商店卖出 5.网上下单

	cter: {type: ObjectId, ref: 'User'},		// 客户
	crter: {type: ObjectId, ref: 'User'},		// 销售人员
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,

	startAt: Date,
	finishAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.categ) this.categ = 1;
		if(!this.step) this.step = 1;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);