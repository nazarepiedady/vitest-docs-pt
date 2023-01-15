const sleep = async n => new Promise(resolve => setTimeout(resolve, n))

export default async function () {
  // setup something eg start a server, db or whatever
  // const server = await start()
  // console.log('globalSetup default-export.js')
  // const start = Date.now()
  await sleep(25)

  return async () => {
    // tear it down here
    // await server.close()
    await sleep(25)
    // const duration = Date.now() - start
    // console.log(`globalTeardown default-export.js, took ${(duration)}ms`)
    // if (duration > 2000)
    //   throw new Error('error from teardown in globalSetup default-export.js')
  }
}
