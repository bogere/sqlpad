const assert = require('assert')
const drivers = require('../drivers')

describe('drivers', function() {
  it('loads and exposes api', function() {
    // This test doesn't test much will expand later
    assert(drivers)
    assert(typeof drivers.getSchema === 'function')
    assert(typeof drivers.runQuery === 'function')
    assert(typeof drivers.testConnection === 'function')
  })

  it('getDrivers()', function() {
    const postgres = drivers.getDrivers('postgres')
    assert.equal(postgres.name, 'postgres')
    assert(Array.isArray(postgres.fields))
    assert(
      postgres.fields.find(field => field.key === 'postgresSsl'),
      'has postgres specific field'
    )
    assert(
      !postgres.fields.find(field => field.key === 'sqlserverEncrypt'),
      'only has postgres fields'
    )

    const driverItems = drivers.getDrivers()
    assert(Array.isArray(driverItems), 'driverItems is array')
    assert(driverItems.find(item => item.name === 'crate'))
    assert(driverItems.find(item => item.name === 'hdb'))
    assert(driverItems.find(item => item.name === 'mysql'))
    assert(driverItems.find(item => item.name === 'postgres'))
    assert(driverItems.find(item => item.name === 'presto'))
    assert(driverItems.find(item => item.name === 'sqlserver'))
    assert(driverItems.find(item => item.name === 'vertica'))
  })

  it('validateConnection()', function() {
    const validPostgres = drivers.validateConnection({
      name: 'testname',
      driver: 'postgres',
      host: 'host',
      port: 'port',
      postgresSsl: true,
      somethingStripped: 'shouldnotmakeit'
    })
    assert.equal(Object.keys(validPostgres).length, 5, 'only 5 keys valid')
    assert.equal(validPostgres.name, 'testname')
    assert.equal(validPostgres.driver, 'postgres')
    assert.equal(validPostgres.host, 'host')
    assert.equal(validPostgres.port, 'port')
    assert.equal(validPostgres.postgresSsl, true)

    assert.throws(() => {
      drivers.validateConnection({ name: 'name' })
    }, 'missing driver throws error')

    assert.throws(() => {
      drivers.validateConnection({ driver: 'postgres' })
    }, 'missing name throws error')

    assert.throws(() => {
      drivers.validateConnection({ name: 'name', driver: 'not exist' })
    }, 'missing driver imp throws error')

    assert.throws(() => {
      drivers.validateConnection({
        name: 'name',
        driver: 'postgres',
        postgresSsl: 'notboolean'
      })
    }, 'boolean not convertable throws error')
  })
})