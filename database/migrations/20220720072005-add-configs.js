module.exports = {
  /**
   *
   * @param {import('mongodb').Db} db
   * @param {import('mongodb').MongoClient} client
   */
  async up(db, client) {
    await db.collection('configs').insertMany([
      {
        key: 'CONFIG_BSC_JSON_RPC_ENDPOINT',
        value: process.env.BSC_PROVIDER_RPC_ENDPOINT,
      },
      {
        key: 'CONFIG_BSC_THE_GRAPH_URL',
        value: process.env.BSC_THE_GRAPH_URL,
      },
      {
        key: 'CONFIG_ETH_THE_GRAPH_URL',
        value: process.env.ETH_THE_GRAPH_URL,
      },
    ]);
  },

  /**
   *
   * @param {import('mongodb').Db} db
   * @param {import('mongodb').MongoClient} client
   */
  async down(db, client) {
    await db.collection('configs').deleteMany({ key: { $in: ['CONFIG_BSC_JSON_RPC_ENDPOINT', 'CONFIG_ETH_THE_GRAPH_URL', 'CONFIG_BSC_THE_GRAPH_URL'] } });
  },
};
