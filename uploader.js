const pinners = require('./pinners');

module.exports = {
  upload: async (options) => {
    const { service } = options;

    console.log("Using upload service: " + service)
  
    if (!Object.keys(pinners).find(key => key === service)) {
      throw new Error('Pinning service is not supported');
    }
  
    const svc = await pinners[service](options);
    return svc.upload(options);
  },
  name: async (options) => {
    const { service } = options;

    console.log("Using name service: " + service)
  
    if (!Object.keys(pinners).find(key => key === service)) {
      throw new Error('Pinning service is not supported');
    }
  
    const svc = await pinners[service](options);
    return svc.name(options);
  }
}
