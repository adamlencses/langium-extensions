
const net = require('net');
const rpc = require('vscode-jsonrpc/node');

const OpenModel = new rpc.RequestType1('server/open');
const CloseModel = new rpc.RequestType1('server/close');
const RequestModel = new rpc.RequestType1('server/request');
const UpdateModel = new rpc.RequestType2('server/update');
const SaveModel = new rpc.RequestType2('server/save');
const ReferenceModel = new rpc.RequestType2('server/references');

const socket = new net.Socket()
const reader = new rpc.SocketMessageReader(socket);
const writer = new rpc.SocketMessageWriter(socket);
const connection = rpc.createMessageConnection(reader, writer);

socket.connect({ port: 5999, host: "localhost" }, () => {
  connection.listen()
  connection.sendRequest(ReferenceModel, "C:\\Users\\david\\VSCodeProjects\\master-thesis\\langium-extensions\\workspace-example\\test.wf", "Task3").then(ret => console.log(ret))
})