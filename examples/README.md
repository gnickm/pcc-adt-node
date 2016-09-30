# pcc-adt Examples

`log-events.js` provides a simple server that prints parts of the received
messages to the console. It handles A01, A02, and A03 messages. Run the server
with the following:

```bash
$ cd examples
$ node log-events.js
```

`client.js` sends messages to `log-events.js`. In the `examples/messages`
directory are several PointClickCare example messages. To send these, run the
following:

```bash
$ cd examples
$ node client.js messages/A01.hl7
```
