//const xss = require('xss');
//const Treeize = require('treeize');

const CollectionsService = {
  getAllCollections(db) {
    return db
      .from('packrat_collections')
      .select('*');
  },

  getCollectionsByUserId(db, userId) {
    return db
      .select('*')
      .from('packrat_collections')
      .where( { user_id: userId } );
  },

  getById(db, id) {
    //console.log(id);
    return CollectionsService.getAllCollections(db)
      .where('id', id)
      .first();
  },

  insertCollection(db, newCollection) {
    console.log(newCollection);
    return db 
      .insert(newCollection)
      .into('packrat_collections')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  
  deleteCollection(db, id) {
    return db('packrat_collections')
      .where({ id })
      .delete();
  },
}

module.exports = CollectionsService;
