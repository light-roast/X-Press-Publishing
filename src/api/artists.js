const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
          } else {
            res.status(200).json({artists: artists});
          }
    })
  });

  artistsRouter.param('artistId', (req, res, next, id) => {
    const sql = 'SELECT * FROM Artist WHERE id = $id';
    const values = { $id: id };
  
    db.get(sql, values, (err, artist) => {
      if (err) {
        next(err);
      } else if (artist) {
        req.artist = artist;
        next();
      } else {
        res.status(404).send();
      }
    });
  });
  
  artistsRouter.get('/:artistId', (req, res) => {
    if (req.artist) {
        res.status(200).json({ artist: req.artist });
      } else {
        res.status(404).send();
      }
  });

  artistsRouter.post('/', (req, res, next) => {
    const requestData = req.body;
    if(requestData.artist.name && requestData.artist.dateOfBirth && requestData.artist.biography){
      requestData.artist.is_currently_employed = requestData.artist.is_currently_employed === 0 ? 0 : 1;
      db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $birth, $bio, $employed)', 
      {$name: requestData.artist.name, 
        $birth: requestData.artist.dateOfBirth, 
        $bio: requestData.artist.biography, 
        $employed: requestData.artist.is_currently_employed
      }, function(err) {
        if (err) {
          console.error(err.message);
          next(err);
        }
        console.log(`A new artist has been added with ID ${this.lastID}`);
        db.get('SELECT * FROM Artist WHERE id = $id', 
        {$id: this.lastID}, (error, row) => {
          res.status(201).json({ artist: row});
        });
      }
        );
        
    } else {
      res.status(400).send('Request not processed successfully. Incomplete data in body req.');
    }
  });
  
module.exports = artistsRouter;
