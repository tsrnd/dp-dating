const socket = io();

socket.on('greeting', d => {
    console.log(d)
})
