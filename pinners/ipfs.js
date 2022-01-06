//const fs = require('fs');
const fetch = require('node-fetch');
//const { Readable } = require('stream');
const FormData = require('form-data');
//const { Blob, File, FormData } = require('formdata-node');
//const { FormDataEncoder } = require('form-data-encoder');
const { create, globSource } = require('ipfs-http-client');
const { URL, URLSearchParams } = require('url');
//const { StringDecoder } = require('string_decoder');
//const decoder = new StringDecoder('utf8');

// cf. https://github.com/octet-stream/form-data-encoder
/*function toReadableStream(encoder) {
  const iterator = encoder.encode()

  return new ReadableStream({
    async pull(controller) {
      const {value, done} = await iterator.next()

      if (done) {
        return controller.close()
      }
      
      console.log('v: (%s)', decoder.write(value))
      controller.enqueue(value)
    }
  })
}/**/

module.exports = {
  name: 'IPFS',
  builder: async (options) => {
    const { host, port, protocol, timeout, headers } = options;

    return create({ host, port, protocol, timeout, headers });
  },
  upload: async (api, options) => {
    const { path, timeout, verbose } = options;

    const files = globSource(path, { recursive: true });
    const { cid } = await api.add(files, { pin: true, timeout });

    if (!cid)
      throw new Error('Content hash is not found.');

    if (verbose)
      console.log(cid);

    return cid;
  },
  name: async(api, options) => {
    const { hash, verbose } = options;
    const timeout = 1000000; // A million millis ~ 16m20s

    // get keys from remote
    const keylist = await api.key.list({ timeout });
    console.log(keylist);

    const name = 'test_key'; // nanoid

    console.log('key in handler', options.keyfile)
    const form = new FormData()
    //const file = new File([options.keyfile], './key.pb')
    //const file = new File(["This is a file."], './key.pb')
    //console.log('file', file)
    //const blob = new Blob([options.keyfile], {type: 'application/octet-stream'})
    //console.log('blob', blob)
    form.append('key', options.keyfile)
    //form.set('key1', blob)
    //const encoder = new FormDataEncoder(form)

    const url = new URL('https://ipfs.komputing.org/api/v0/key/import')
    const params = { 'arg': name }
    url.search = new URLSearchParams(params).toString();
    console.log(url)
    //console.log(encoder.headers)
    //console.log(encoder.boundary)
    console.log('fetching')

    const keyinfo = await fetch(url, {
        method: 'POST',
        body: form, //atoReadableStream(encoder),// Readable.from(encoder.encode()),
        headers: form.getHeaders(),
        //timeout
    })
    console.log('got:')
    console.log(await keyinfo.json());
    console.log('continuing...')

    //const keyinfo = await api.key.import(name, key, password, { body: Readable.from(encoder), headers, timeout })
    //console.log(keyinfo);

    const version = await api.version({ timeout });
    console.log(version);

    const payload = await api.name.publish(hash, { key: name, timeout });
    console.log(payload);

    const delinfo = await api.key.rm(name, { timeout })
    console.log(delinfo);

    return payload;
  }
}
