getTvShowsByUserId(db, userId) {
    return db
      .select('*')
      .from('tv_table')
      .where( { user_id: userId } );
  },

  ALTER TABLE tv_table
  ADD COLUMN
    user_id INTEGER REFERENCES tv_users(id) ON DELETE SET NULL NOT NULL;

    tvRouter
    .route('/all')
    .get(requireAuth, (req,res,next) => {
      const db = req.app.get('db');    
      TvService.getTvShowsByUserId(db, req.user.id)
        .then(shows => {
          return res.status(200).json(shows.map(serializeShow));
        })
        .catch(next);
    })