var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Connect to MongoDB (safe if DB env var isn't set yet).
try {
    if (process.env.DB && mongoose.connection.readyState === 0) {
        mongoose.connect(process.env.DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, () => console.log("connected"));
    }
} catch (error) {
    console.log("could not connect");
}

var ActorSchema = new Schema({
    actorName: { type: String, required: true },
    characterName: { type: String, required: true }
}, { _id: false });

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true },
    releaseDate: { type: Number, required: true }, // year released
    genre: { type: String, required: true },
    actors: { type: [ActorSchema], required: true }
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);