const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Mtrial';
const dbSchema = new Schema({
	code: String,

	MtCateg: {type: ObjectId, ref: 'MtCateg'},
	MtFirm: {type: ObjectId, ref: 'MtFirm'},

	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String,
		desp: String,
	}],
	photo: String,

	/* ------------------ 价格 ------------------ */
	cost: Float,

	shelf: Number,
	weight: Number,
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.weight) this.weight = 1;
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);