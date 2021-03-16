const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Odsku';
const dbSchema = new Schema({
	/* ------------------ Basic ------------------ */
	Odspu: {type: ObjectId, ref: 'Odspu'},

	Pdspu: {type: ObjectId, ref: 'Pdspu'},
	Ptern: {type: ObjectId, ref: 'Ptern'},

	size: Number
	Color: {type: ObjectId, ref: 'Color'},

	/* ------------------ 库存 ------------------ */
	quan: Number,
	ship: Number,	// 发货量

	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.quan) this.quan = 0;
		if(!this.ship) this.ship = 0;
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);