const express = require('express');
const router = express.Router();
const redis = require('../redis')

const configs = require('../util/config')

let visits = 0

const initRedis = async () => {
  const redisDb = await redis.getAsync("added_todos")
  if (!redisDb) {
    await redis.setAsync("added_todos", 0)
  }
}
initRedis();

/* GET index data. */
router.get('/', async (req, res) => {
  visits++

  res.send({
    ...configs,
    visits
  });
});

router.get('/statistics', async (req, res) => {
  const getRedisDb = await redis.getAsync("added_todos")
  const todoCounter = Number(getRedisDb) ? Number(getRedisDb) : 0
  const redisDb = JSON.stringify({
    "added_todos": todoCounter
  })
  res.send(redisDb)
})

module.exports = router;
