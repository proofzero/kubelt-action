const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const uploader = require('./uploader');

async function run() {
  try {
    const secret = core.getInput('secret');
    const cidpath = core.getInput('cidpath');
    const path = core.getInput('path');
    const service = core.getInput('service');
    const host = core.getInput('host');
    const port = core.getInput('port');
    const protocol = core.getInput('protocol');
    const headers = core.getInput('headers');
    const pinataKey = core.getInput('pinataKey');
    const pinataSecret = core.getInput('pinataSecret');
    const pinataPinName = core.getInput('pinataPinName');
    const timeout = core.getInput('timeout');
    const verbose = (core.getInput('verbose') === 'true');

    const options = {
      secret,
      cidpath,
      path,
      service,
      host,
      port,
      protocol,
      headers: JSON.parse(headers),
      pinataKey,
      pinataSecret,
      pinataPinName,
      timeout,
      verbose 
    };

    if (secret) {
        options.keyfile = Buffer.from(secret, 'base64') //.toString('utf-8').replace(/\n$/, '')
        console.log('keyfile utf:', options.keyfile.toString('utf-8'))
        console.log('keyfile', options.keyfile)
        console.log('keyfile len', options.keyfile.length)
    }

    console.log("Using CID: " + cidpath)

    if (cidpath) {
        // TODO: Validate inputs!
        // TODO: Should support list of hashes.
        options.hash = fs.readFileSync(cidpath, 'UTF-8').replace(/\n$/, '')
    } else {
        // If we're not passed a hash, add the path to get a CID.
        const hash = await uploader.upload(options).catch((err) => { throw err; });
        core.setOutput('hash', hash.toString());
        options.hash = '/ipfs/' + hash
    }

    // Publish the passed or new CID as a name.
    const name = await uploader.name(options).catch((err) => { throw err; });
    core.setOutput('name', name.toString());

    if (verbose) {
      // Get the JSON webhook payload for the event that triggered the workflow
      const payload = JSON.stringify(github.context.payload, undefined, 2);
      console.log(`The event payload: ${payload}`);
    }

    console.log('IPFS actions finished successfully');
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}

module.exports = run;
