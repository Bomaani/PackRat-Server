const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Collections Endpoints', function() {
  let db

  const {
    testUsers,
    testCollections,
    testItems,
  } = helpers.makeCollectionsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /packrat/collections`, () => {
    context(`Given no collections`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/packrat/collections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context('Given there are collections in the database', () => {
      beforeEach('insert collections', () =>
        helpers.seedCollectionsTables(
          db,
          testUsers,
          testCollections,
          testItems
        )
      )

      it('responds with 200 and all of the collections', () => {
        const expectedCollections = testCollections.map(collection =>
          helpers.makeExpectedCollection(
            testUsers,
            collection,
            testItems
          )
        )
        return supertest(app)
          .get('/packrat/collections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedCollections)
      })
    })
  })

  describe(`GET /packrat/collections/:collection_id`, () => {
    context(`Given no collections`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const collectionId = 123456
        return supertest(app)
          .get(`/packrat/collections/${collectionId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { message: `collection not found` })
      })
    })

    context('Given there are collections in the database', () => {
      beforeEach('insert collections', () =>
        helpers.seedCollectionsTables(
          db,
          testUsers,
          testCollections,
          testItems,
        )
      )

      it('responds with 200 and the specified collection', () => {
        const collectionId = 2
        const expectedCollection = helpers.makeExpectedCollection(
          testUsers,
          testCollections[collectionId - 1],
          testItems,
        )

        return supertest(app)
          .get(`/packrat/collections/${collectionId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedCollection)
      })
    })
  })

  describe(`GET /packrat/collections/:collection_id/items`, () => {
    context(`Given no collections`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const collectionId = 123456
        return supertest(app)
          .get(`/packrat/collections/${collectionId}/items`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Collection doesn't exist` })
      })
    })

    context('Given there are items for collection in the database', () => {
      beforeEach('insert collections', () =>
        helpers.seedCollectionsTables(
          db,
          testUsers,
          testCollections,
          testItems,
        )
      )
    })
  })
})
