const videocall=(io)=>{

    const socket_to_room=new Map()
    const userid_to_socket=new Map()

    io.on("connection",(socket)=>{

        //console.log("User connected"+socket.id)

        socket.on("get-online",(userid)=>{
            console.log("get online",userid,socket.id)
            userid_to_socket.set(userid,socket.id)
        })

        socket.on("join-room",(room)=>{
            //console.log("joined room",room)
            socket_to_room.set(socket.id,room)
            socket.emit("room-joined",room)
        })

        socket.on("start-call",({remoteid,offer,roomid})=>{
            //console.log(remoteid)
            //console.log(roomid)
            const remote_socket_id=userid_to_socket.get(remoteid)
            //console.log(remote_socket_id,"room id-",roomid)
            socket.to(remote_socket_id).emit("answer-call",{offer,caller_socketid:socket.id,roomid})
        })

        socket.on("call-accepted",({caller_socketid,answer})=>{
            //console.log(caller_socketid)
            socket.to(caller_socketid).emit("call-accepted",{caller_socketid:socket.id,answer})
        })

        socket.on("call-ended",(caller_socketid)=>{
            socket.to(caller_socketid).emit("call-ended")
        })

        socket.on("nego-needed",({offer,remoteid})=>{
            console.log("nego needed" , remoteid)
            const remote_socket_id=userid_to_socket.get(remoteid)
            socket.to(remote_socket_id).emit("peer-nego-needed",({offer,caller_socketid:socket.id}))
        })

        socket.on("nego-needed2",({offer,caller_socketid})=>{
            console.log("nego needed2" , caller_socketid)
            socket.to(caller_socketid).emit("peer-nego-needed",({offer,reciver_socketid:socket.id}))
        })
        
        socket.on("nego-final",({answer,caller_socketid})=>{
            console.log("final nego",caller_socketid)
            socket.to(caller_socketid).emit("nego-done",answer)
        })

        socket.on("disconnect", () => {
            userid_to_socket.forEach((val, key) => {
                if (val === socket.id) userid_to_socket.delete(key);
            });
        
            socket_to_room.delete(socket.id);
        });
        
    })
}

export default videocall
