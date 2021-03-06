const hdb = require('hdb')
const QueryResult = require('../models/QueryResult')
const { formatSchemaQueryResults } = require('./utils')

function getSchemaSql(schema) {
  const whereSql = schema ? `WHERE tables.SCHEMA_NAME = '${schema}'` : ''
  return `
    SELECT 
      columns.SCHEMA_NAME as table_schema, 
      columns.TABLE_NAME as table_name, 
      columns.COLUMN_NAME as column_name, 
      columns.DATA_TYPE_NAME as data_type
    FROM 
      SYS.TABLES tables
      JOIN SYS.COLUMNS columns ON tables.SCHEMA_NAME = columns.SCHEMA_NAME AND tables.TABLE_NAME = columns.TABLE_NAME
    ${whereSql}
    ORDER BY 
     columns.POSITION
  `
}

function runQuery(query, connection) {
  const queryResult = new QueryResult()
  return new Promise((resolve, reject) => {
    const client = hdb.createClient({
      host: connection.host,
      port: connection.hanaport,
      database: connection.hanadatabase,
      user: connection.username,
      password: connection.password,
      schema: connection.hanaSchema
    })
    client.on('error', err => {
      console.error('Network connection error', err)
      return reject(err)
    })
    client.connect(err => {
      if (err) {
        console.error('Connect error', err)
        return reject(err)
      }
      return client.exec(query, (err, rows) => {
        queryResult.addRows(rows)
        client.disconnect()
        if (err) {
          return reject(err)
        }
        return resolve(queryResult)
      })
    })
  })
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = 'select * from DUMMY'
  return runQuery(query, connection)
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getSchemaSql(connection.hanaSchema)
  return runQuery(schemaSql, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  )
}

module.exports = {
  getSchema,
  runQuery,
  testConnection
}
