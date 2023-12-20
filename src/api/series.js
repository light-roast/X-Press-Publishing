const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err);
          } else {
            res.status(200).json({series: series});
          }
    })
  });

seriesRouter.param('seriesId', (req, res, next, id) => {
    const sql = 'SELECT * FROM Series WHERE id = $id';
    const values = { $id: id };
  
    db.get(sql, values, (err, series) => {
      if (err) {
        next(err);
      } else if (series) {
        req.series = series;
        next();
      } else {
        res.status(404).send();
      }
    });
  });

  seriesRouter.get('/:seriesId', (req, res) => {
    if (req.series) {
        res.status(200).json({ series: req.series });
      } else {
        res.status(404).send();
      }
  });

  seriesRouter.post('/', (req, res, next) => {
    const requestData = req.body;
    if(requestData.series.name && requestData.series.description){
      db.run('INSERT INTO Series(name, description) VALUES ($name, $description)', 
      {$name: requestData.series.name, 
        $description: requestData.series.description 
      }, function(err) {
        if (err) {
          console.error(err.message);
          next(err);
        }
        console.log(`A new series has been added with ID ${this.lastID}`);
        db.get('SELECT * FROM Series WHERE id = $id', 
        {$id: this.lastID}, (error, row) => {
          res.status(201).json({ series: row});
        });
      }
        );
        
    } else {
      res.status(400).send('Request not processed successfully. Incomplete data in body req.');
    }
  });

  seriesRouter.put('/:seriesId', (req, res, next) => {
    const seriesId = req.params.seriesId;
    const requestData = req.body;
    if (
      requestData.series &&
      requestData.series.name &&
      requestData.series.description
    ) {
      
      db.run('UPDATE Series SET name = $name, description = $description WHERE id = $seriesId', 
      {$name: requestData.series.name,
       $description: requestData.series.description,
       $seriesId: seriesId
      }, (err) => {
        if(err) {
          next(err);
          res.status(500).send('Internal Server Error. Update failed.');
          return;
        }
        db.get('SELECT * FROM Series WHERE id = $seriesId', {$seriesId: seriesId}, (error, row) => {
          if (error) {
            console.error(error.message);
            next(error);
            res.status(500).send('Internal Server Error. Failed to retrieve updated series.');
          } else {
            res.status(200).send({ series: row });
          }
        })
      })
    } else {
      res.status(400).send('Bad Request. Incomplete data in body req.');
    }
  });

  seriesRouter.use('/:seriesId/issues', issuesRouter);



module.exports = seriesRouter;