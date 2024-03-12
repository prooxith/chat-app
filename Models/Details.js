const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailSchema = new Schema({
	user :{
		type: String,
		required: true
	},
	message:{
		type: String,
		required: true
	},
	profile:{
		type:String,
		required: true
	}
}, {timestamps: true});

const Detail = mongoose.model('Users_message', detailSchema);
module.exports = Detail;