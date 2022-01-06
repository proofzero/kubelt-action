# kubelt-publish

Based on [aquiladev/ipfs-action](https://github.com/aquiladev/ipfs-action/).

# Introduction

This GitHub Action publishes content to IPFS and updates its IPNS name.

IPFS is a p2p content-addressed storage network. If you change content its
content address (CID) changes. This makes linking unstable. IPNS names are
pointers to CIDs that make them stable.

This action makes it easy to publish to IPFS, for example on `git push`, and to
publish an IPNS name that points to that updated content.

# Getting Started

Install the action and configure a publishing key and a path.

To generate a publishing key on your local IPFS node:

1. `ipfs key gen publishing_key`
1. `ipfs key export publishing_key`
1. `base64 publishing_key > key.b64`

`key.b64` now contains the base64-encoded version of your publishing key.
Copy/paste the contents of this file into a [GitHub encrypted secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets). For example, on a Mac:

```bash
cat key.b64 | pbcoby
```

Configure the action to use your repo secret. Here is the example configuration
[Kubelt](https://kubelt.com) uses to publish our whitepaper:

```yaml
  - name: Pin and name on IPFS
    uses: proofzero/kubelt-action@v1.0.0
    id: ipfs
    with:
      secret: ${{ secrets.NAME_PUBLISHING_KEY }}
      # PDF generated earlier.
      path: kubelt_whitepaper.pdf
      verbose: true
```

# Development Notes

The action works by asking remote IPFS peers to act on its behalf, both for
publishing content and publishing names. This is accomplished via the IFPS API.

There are currently two language platforms for the API: JavaScript and Golang.
The JavaScript API gets us most of the way there, but doesn't allow key
importation. Therefore we call both APIs.

We need key importation because we are asking remote peers to publish names for
us. The peers need our key to do that, and cannot determinsitically generate
keys themselves. Therefore we need to send them our key.

For relevant API documentation see:

https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/NAME.md
https://docs.ipfs.io/reference/http/api/#api-v0-key-import

JavaScript and Golang use different key formats as well. JavaScript
standardizes on PEM files, Golang releases 0.12.0 and lower use a serialized
protocol buffers containing the key.

Golang 0.11.0 is prevalent at this writing so the base64-encoded secret
generated above contains a protobuf that contains the key. This formatting issue
should be opaque to the user of this action as the key formats are upgraded, and
is partially why we use a blend of the js REST API and the go REST API (js
doesn't accept keys POSTed in the body, go requires it).

For discussion see:

https://discuss.ipfs.io/t/importing-pem-encoded-private-key/12770/9
https://github.com/ipfs/go-ipfs/issues/8594
https://github.com/ipfs/go-ipfs/pull/8616

