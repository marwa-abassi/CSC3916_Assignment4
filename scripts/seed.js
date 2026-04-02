/**
 * Populate MongoDB with sample movies and at least one review each.
 * Run: npm run seed   (requires DB in .env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const path = require('path');

if (!process.env.DB) {
  console.error('Set DB in your .env file (MongoDB connection string).');
  process.exit(1);
}

const SEED_TITLES = [
  'The Good, the Bad and the Ugly',
  'Inception',
  'Spirited Away'
];

const movieDocs = [
  {
    title: 'The Good, the Bad and the Ugly',
    releaseDate: 1966,
    genre: 'Western',
    actors: [
      { actorName: 'Clint Eastwood', characterName: 'Blondie' },
      { actorName: 'Eli Wallach', characterName: 'Tuco' },
      { actorName: 'Lee Van Cleef', characterName: 'Angel Eyes' }
    ]
  },
  {
    title: 'Inception',
    releaseDate: 2010,
    genre: 'Sci-Fi',
    actors: [
      { actorName: 'Leonardo DiCaprio', characterName: 'Cobb' },
      { actorName: 'Joseph Gordon-Levitt', characterName: 'Arthur' },
      { actorName: 'Elliot Page', characterName: 'Ariadne' }
    ]
  },
  {
    title: 'Spirited Away',
    releaseDate: 2001,
    genre: 'Animation',
    actors: [
      { actorName: 'Rumi Hiiragi', characterName: 'Chihiro Ogino' },
      { actorName: 'Miyu Irino', characterName: 'Haku' }
    ]
  }
];

async function run() {
  await mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const Movie = require(path.join(__dirname, '..', 'Movies'));
  const Review = require(path.join(__dirname, '..', 'Reviews'));
  const User = require(path.join(__dirname, '..', 'Users'));

  const old = await Movie.find({ title: { $in: SEED_TITLES } }).select('_id');
  const oldIds = old.map((d) => d._id);
  if (oldIds.length) {
    await Review.deleteMany({ movieId: { $in: oldIds } });
    await Movie.deleteMany({ _id: { $in: oldIds } });
  }

  const movies = await Movie.insertMany(movieDocs);

  for (const m of movies) {
    await Review.create({
      movieId: m._id,
      username: 'demo_critic',
      review: `Really enjoyed ${m.title} — strong ${m.genre.toLowerCase()} pick.`,
      rating: 5
    });
  }

  const demoUser = {
    name: 'Demo Student',
    username: 'demo_student@example.com',
    password: 'DemoPass123'
  };
  await User.deleteOne({ username: demoUser.username });
  await new User(demoUser).save();

  console.log(`Seeded ${movies.length} movies, ${movies.length} reviews, and 1 demo user.`);
  console.log('Demo sign-in (POST /signin):');
  console.log(`  username: ${demoUser.username}`);
  console.log(`  password: ${demoUser.password}`);
  console.log('\nMovie IDs (use in GET /movies/:id and POST /reviews):');
  movies.forEach((m) => console.log(`  ${m._id}  ${m.title}`));

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
