const express = require("express");
const path = require("path");
const xss = require("xss");
const ItemsService = require("./items-service");
const { requireAuth } = require("../middleware/jwt-auth");

const itemsRouter = express.Router();
const jsonParser = express.json();

const serializeItem = item => ({
  id: item.id,
  title: xss(item.title),
  info: item.info,
  image_url: item.image_url,
  collection_id: item.collection_id
});

itemsRouter
  .route("/")
  .get((req, res, next) => {
    ItemsService.getAllItems(req.app.get("db"))
      .then(items => {
        res.json(items);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, info, year_released, image_url, collection_id } = req.body;

    console.log(req.body);
    if (!title) {
      console.log("Title is required");
      return res.status(400).send({error: `Missing title in request body`});
    }
    if (!info) {
      console.log("Info is required");
      return res.status(400).send({error: `Missing info in request body`});
    }
    if (!year_released) {
      console.log("Year Released is required");
      return res.status(400).send({error: `Missing year_released in request body`});
    }
    if (!collection_id) {
      console.log("Collection_id is required");
      return res.status(400).send({error: `Missing collection_id in request body`});
    }
    if (!image_url) {
      console.log("Image_URL is required");
      return res.status(400).send({error: `Missing image_url in request body`});
    }

    const newItem = { title, info, year_released, image_url, collection_id };

    ItemsService.insertItem(req.app.get("db"), newItem)
      .then(item => {
        console.log(`item with id ${item.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

itemsRouter
  .route("/:item_id")
  .all(requireAuth)
  .all((req, res, next) => {
    return ItemsService.getById(req.app.get("db"), req.params.item_id)
      .then(item => {
        if (!item) {
          return res.status(404).json({
            error: { message: "item not found" }
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeItem(res.item));
  })
  .delete((req, res, next) => {
    const { item_id } = req.params;
    ItemsService.deleteItem(req.app.get("db"), item_id)
      .then(numRowsAffected => {
        console.log(`Item with id ${item_id} deleted.`);
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { title, info, year_released, image_url, collection_id } = req.body;
    const itemToUpdate = {
      title,
      info,
      year_released,
      image_url,
      collection_id
    };

    const numOfValues = Object.values(itemToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
      return res.status(400).json({
        error: {
          message:
            "Request body must contain either 'title', 'info', 'year_released', 'image_url', 'collection_id'"
        }
      });
    }

    ItemsService.updateItem(req.app.get("db"), req.params.item_id, itemToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

itemsRouter
  .route("/item/:item_id")
  .all(checkItemExists)
  .all(requireAuth)
  .all((req, res, next) => {
    ItemsService.getById(req.app.get("db"), req.params.item_id)
      .then(item_id => {
        res.json(item_id);
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeItem(res.item));
  });

async function checkItemExists(req, res, next) {
  try {
    const item = await ItemsService.getById(
      req.app.get("db"),
      req.params.item_id
    );

    if (!item)
      return res.status(404).json({
        error: `Item doesn't exist`
      });

    res.item = item;
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = itemsRouter;
