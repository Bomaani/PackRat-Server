const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Items Endpoints', function() {
  let db;

  const { testCollections, testUsers } = helpers.makeCollectionsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /packrat/items', () => {
    beforeEach('insert collections', () =>
      helpers.seedCollectionsTables(db, testUsers, testCollections)
    );

    it('creates an item, responding with 201 and the new item', function() {
      this.retries(3);
      const testCollection = testCollections[0];
      const testUser = testUsers[0];
      const newItem = {
        title: 'Test new item',
        year_released: 1993,
        info: 'test info',
        image_url: 'testimage.com',
        collection_id: testCollection.id
      };
      return supertest(app)
        .post('/packrat/items')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(newItem.title);
          expect(res.body.info).to.eql(newItem.info);
          expect(res.body.image_url).to.eql(newItem.image_url);
          expect(res.body.collection_id).to.eql(newItem.collection_id);
          expect(res.headers.location).to.eql(`/packrat/items/${res.body.id}`);
        })
        .expect(res =>
          db
            .from('packrat_items')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(newItem.title);
              expect(row.info).to.eql(newItem.info);
              expect(row.collection_id).to.eql(newItem.collection_id);
              expect(row.year_released).to.eql(newItem.year_released);
              expect(row.image_url).to.eql(newItem.image_url);
            })
        );
    });

    const requiredFields = [
      'title',
      'info',
      'collection_id',
      'year_released',
      'image_url'
    ];

    requiredFields.forEach(field => {
      const testCollection = testCollections[0];
      //const testUser = testUsers[0];
      const newItem = {
        title: 'Test new item',
        info: 'test info',
        collection_id: testCollection.id,
        year_released: 1993,
        image_url: 'testimage.com'
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newItem[field];

        return supertest(app)
          .post('/packrat/items')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newItem)
          .expect(400, {
            error: `Missing ${field} in request body`
          });
      });
    });
  });
});
