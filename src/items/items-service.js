

const ItemsService = {
  getAllItems(db) {
    return db.from('packrat_items').select('*');
  },

  getById(db, id) {
    //console.log('get by id', id)
    return ItemsService.getAllItems(db)
      .where('id', id)
      .first();
  },

  insertItem(db, newItem) {
    console.log(newItem);
    return db 
      .insert(newItem)
      .into('packrat_items')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  deleteItem(db, id) {
    return db
      .from('packrat_items')
      .where({ id })
      .delete();
  },

  updateItem(db, id, newItemFields) {
    return db('packrat_items')
      .where({ id })
      .update(newItemFields);
  }
};

module.exports = ItemsService;