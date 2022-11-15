// Socket IO
const { io } = require("socket.io-client");
const socket = io("http://backend.ziot.vn:5006");

socket.on("connect", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  //console.log(socket.id); // undefined
});

socket.on("iot-update",(msg)=>{
	console.log('message: ' + msg);
})