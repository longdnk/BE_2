// build server
var express = require("express");
var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

// tạo kết nối giữa client và server
io.on("connection", function(socket)
	{
        console.log(socket.id)
		socket.on("disconnect", function()
			{
			});
         //server lắng nghe dữ liệu từ client
		socket.on("Client-sent-data", function(data)
			{
                console.log(data)
				//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
                socket.emit("Server-sent-data", data);
			});
    
      socket.on("iot-update", function(data)
			{
                console.log(data)
				//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
                //socket.emit("Server-sent-data", data);
			});
    
	});

// create route, display view

