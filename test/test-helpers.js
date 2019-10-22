const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      username: "test-user-1",
      fullname: "Test user 1",
      password: "password"
    },
    {
      id: 2,
      username: "test-user-2",
      fullname: "Test user 2",
      password: "password"
    },
    {
      id: 3,
      username: "test-user-3",
      fullname: "Test user 3",
      password: "password"
    },
    {
      id: 4,
      username: "test-user-4",
      fullname: "Test user 4",
      password: "password"
    }
  ];
}

function makeCollectionsArray(users) {
  return [
    {
      id: 1,
      title: "First test collection!",
      user_id: users[0].id
    },
    {
      id: 2,
      title: "Second test collection!",
      user_id: users[1].id
    },
    {
      id: 3,
      title: "Third test collection!",
      user_id: users[2].id
    },
    {
      id: 4,
      title: "Fourth test collection!",
      user_id: users[3].id
    }
  ];
}

function makeItemsArray(collections) {
  return [
    {
      id: 1,
      title: "first test item",
      year_released: 1993,
      collection_id: collections[0].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 2,
      title: "second test item",
      year_released: 1994,
      collection_id: collections[1].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 3,
      title: "third test item",
      year_released: 1995,
      collection_id: collections[2].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 4,
      title: "fourth test item",
      year_released: 1993,
      collection_id: collections[3].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 5,
      title: "fifth test item",
      year_released: 1993,
      collection_id: collections[1].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 6,
      title: "sixth test item",
      year_released: 1993,
      collection_id: collections[2].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    },
    {
      id: 7,
      title: "seventh test item",
      year_released: 1993,
      collection_id: collections[2].id,
      info: "Lorem ipsum dolor sit amet, consectetur adipisicing",
      image_url: "http://placehold.it/500x500"
    }
  ];
}

function makeExpectedCollection(users, collection, items = []) {
  const user = users.find(user => user.id === collection.user_id);

  const CollectionItems = items.filter(item => item.collection_id === collection.id);

  const number_of_items = CollectionItems.length;

  return {
    id: collection.id,
    title: collection.title
  };
}

function makeCollectionsFixtures() {
  const testUsers = makeUsersArray();
  const testCollections = makeCollectionsArray(testUsers);
  const testItems = makeItemsArray(testUsers, testCollections);
  return { testUsers, testCollections, testItems };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        packrat_collections,
        packrat_users,
        packrat_items
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE packrat_collections_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE packrat_users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE packrat_items_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('packrat_collections_id_seq', 0)`),
          trx.raw(`SELECT setval('packrat_users_id_seq', 0)`),
          trx.raw(`SELECT setval('packrat_items_id_seq', 0)`)
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 6)
  }));
  return db
    .into("packrat_users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('packrat_users_id_seq', ?)`, [
        users[users.length - 1].id
      ])
    );
}

function seedCollectionsTables(db, users, collections, items = []) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("packrat_collections").insert(collections);
    await trx.raw(`SELECT setval('packrat_collections_id_seq', ?)`, [
      collections[collections.length - 1].id
    ]);
    // only insert comments if there are some, also update the sequence counter
    if (items.length) {
      await trx.into("packrat_items").insert(items);
      await trx.raw(`SELECT setval('packrat_items_id_seq', ?)`, [
        items[items.length - 1].id
      ]);
    }
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeCollectionsArray,
  makeExpectedCollection,
  makeItemsArray,

  makeCollectionsFixtures,
  cleanTables,
  seedCollectionsTables,
  makeAuthHeader,
  seedUsers
};
