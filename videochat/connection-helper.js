class Connection {
    constructor(remoteClient, AblyRealtime, initiator, stream) {
        console.log(`Opening connection to ${remoteClient}`)
        this._remoteClient = remoteClient
        this.isConnected = false
        this._p2pConnection = new SimplePeer({
            initiator: initiator,
            stream: stream
        })
        this._p2pConnection.on('signal', this._onSignal.bind(this))
        this._p2pConnection.on('error', this._onError.bind(this))
        this._p2pConnection.on('connect', this._onConnect.bind(this))
        this._p2pConnection.on('close', this._onClose.bind(this))
        this._p2pConnection.on('stream', this._onStream.bind(this))
    }
    handleSignal(signal) {
        this._p2pConnection.signal(signal)
    }
    send(msg) {
        this._p2pConnection.send(msg)
    }
    destroy() {
        this._p2pConnection.destroy()
    }
    _onSignal(signal) {
        AblyRealtime.publish(`rtc-signal/${this._remoteClient}`, {
            user: clientId,
            signal: signal
        })
    }
    _onConnect() {
        this.isConnected = true
        console.log('connected to ' + this._remoteClient)
    }
    _onClose() {
        console.log(`connection to ${this._remoteClient} closed`)
        handleEndCall(this._remoteClient)
    }
    _onStream(data) {
        receiveStream(this._remoteClient, data)
    }
    _onError(error) {
        console.log(`an error occurred ${error.toString()}`)
    }
}

function call(client_id) {
    if (client_id === clientId) return
    alert(`attempting to call ${client_id}`)
    AblyRealtime.publish(`incoming-call/${client_id}`, {
            user: clientId
        })
}
AblyRealtime.subscribe(`incoming-call/${clientId}`, call => {
    if (currentCall != undefined) {
        // user is on another call
        AblyRealtime.publish(`call-details/${call.data.user}`, {
            user: clientId,
            msg: 'User is on another call'
        })
        return
    }
    var isAccepted = confirm(`You have a call from ${call.data.user}, do you want to accept?`)
    if (!isAccepted) {
        // user rejected the call
        AblyRealtime.publish(`call-details/${call.data.user}`, {
            user: clientId,
            msg: 'User declined the call'
        })
        return
    }
    currentCall = call.data.user
    AblyRealtime.publish(`call-details/${call.data.user}`, {
        user: clientId,
        accepted: true
    })
})
AblyRealtime.subscribe(`call-details/${clientId}`, call => {
    if (call.data.accepted) {
        initiateCall(call.data.user)
    } else {
        alert(call.data.msg)
    }
})

function initiateCall(client_id) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            /* use the stream */
            localStream = stream
            var video = document.getElementById('local')
            video.src = window.URL.createObjectURL(stream)
            video.play()
                // Create a new connection
            currentCall = client_id
            if (!connections[client_id]) {
                connections[client_id] = new Connection(client_id, AblyRealtime, true, stream)
            }
            document.getElementById('call').style.display = 'block'
        })
        .catch(function(err) {
            /* handle the error */
            alert('Could not get video stream from source')
        })
}
AblyRealtime.subscribe(`rtc-signal/${clientId}`, msg => {
    if (localStream === undefined) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                /* use the stream */
                localStream = stream
                var video = document.getElementById('local')
                video.src = window.URL.createObjectURL(stream)
                video.play()
                connect(msg.data, stream)
            })
            .catch(function(err) {
                alert('error occurred while trying to get stream')
            })
    } else {
        connect(msg.data, localStream)
    }
})
function connect(data, stream) {
    if (!connections[data.user]) {
        connections[data.user] = new Connection(data.user, AblyRealtime, false, stream)
    }
    connections[data.user].handleSignal(data.signal)
    document.getElementById('call').style.display = 'block'
}
function receiveStream(client_id, stream) {
    var video = document.getElementById('remote')
    video.src = window.URL.createObjectURL(stream)
    video.play()
    renderMembers()
}

function handleEndCall(client_id = null) {
    if (client_id && client_id != currentCall) {
        return
    }
    client_id = currentCall;
    alert('call ended')
    currentCall = undefined
    connections[client_id].destroy()
    delete connections[client_id]
    for (var track of localStream.getTracks()) {
        track.stop()
    }
    localStream = undefined
    document.getElementById('call').style.display = 'none'
}