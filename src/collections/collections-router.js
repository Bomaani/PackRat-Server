const path = require("path");
const express = require("express");
const xss = require("xss");
const CollectionsService = require("./collections-service");
const { requireAuth } = require("../middleware/jwt-auth");

const collectionsRouter = express.Router();
const jsonParser = express.json();

const serializeCollection = collection => ({
  id: collection.id,
  title: xss(collection.title)
});

collectionsRouter
  .route("/")
  .get(requireAuth, (req, res, next) => {
  const db = req.app.get("db");
  CollectionsService.getCollectionsByUserId(db, req.user.id)
    .then(collections => {
      return res.status(200).json(collections.map(serializeCollection)); 
    })
    .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { title } = req.body;

    if (!title) {
      console.error("Title is required");
      return res.status(400).send("Invalid data");
    }

    const newCollection = { title };
    newCollection.user_id = req.user.id;

    CollectionsService.insertCollection(req.app.get("db"), newCollection)
      .then(collection => {
        console.log(`collection with id ${collection.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${collection.id}`))
          .json(serializeCollection(collection));
      })
      .catch(next);
  });

collectionsRouter
  .route("/:collection_id")
  .all((req, res, next) => {
    CollectionsService.getById(req.app.get("db"), req.params.collection_id)
      .then(collection => {
        if (!collection) {
          return res.status(404).json({
            error: { message: "collection not found" }
          });
        }
        res.collection = collection;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeCollection(res.collection));
  })
  .delete((req, res, next) => {
    const { collection_id } = req.params;
    CollectionsService.deleteCollection(
      req.app.get('db'),
      collection_id
    )
      .then(numRowsAffected => {
        console.log(`Collection with id ${collection_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

collectionsRouter
  .route("/:collection_id/items")
  .all(checkCollectionExists)
  .all(requireAuth)
  .get((req, res, next) => {
    CollectionsService.getItemsForCollection(
      req.app.get("db"),
      req.params.collection_id
    )
      .then(items => {
        res.json(items);
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkCollectionExists(req, res, next) {
  try {
    const collection = await CollectionsService.getById(
      req.app.get("db"),
      req.params.collection_id
    );

    if (!collection)
      return res.status(404).json({
        error: `Collection doesn't exist`
      });

    res.collection = collection;
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = collectionsRouter;
