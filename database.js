var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(CONFIG.DATABASE);

var Movie = new Schema({

    name: [{type: String, index: true}],
    poster: [{type: String}],
    view: [{
        origin: {type: String, index: true},
        url: {type: String}
    }],
    director: {type: String, index: true},
    actor: [{type: String, index: true}],
    description: {type: String},

    createTime: {type: Date, default: Date.now()},
    updateTime: {type: Date, default: Date.now()}
});

mongoose.model('movie', Movie, 'movie');
