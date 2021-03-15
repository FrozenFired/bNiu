const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdsku';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Pattern: {type: ObjectId, ref: 'Pattern'},
	Color: {type: ObjectId, ref: 'Color'},
	size: Number,

	/* ------------------ 库存 ------------------ */
	stock: Number,
	sale: Number,


	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.stock) this.stock = 0;
		if(!this.sale) this.sale = 0;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);