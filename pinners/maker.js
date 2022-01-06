module.exports = ({ builder, upload, name }) => async options => {
  const api = await builder(options);

  return {
    upload: async (options) => {
      const { path } = options;
      if (!path) {
        throw new Error('Path is empty'); 
      }
      
      return upload(api, options);
    },
    name: async (options) => {
      const { hash } = options;
      if (!hash) {
        throw new Error('Hash is empty'); 
      }
      
      return name(api, options);
    }
  }
}
