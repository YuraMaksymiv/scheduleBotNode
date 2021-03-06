const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

module.exports = (async () => {
    let conn = await mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});
})
