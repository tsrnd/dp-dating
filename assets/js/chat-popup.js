var socket = io('http://localhost:3002');
socket.on('connect', function(socketIO) {
    var token = localStorage.tokenChat;
    socket.emit('authenticate', {
        token: token
    });
});

var userOnline;
socket.on('loadusersOnl', data => {
    userOnline = data;
});

socket.on('loadMessage', data => {
    content = JSON.parse(data);
    userInfo = JSON.parse(localStorage.authInfo);
    $.get({
        url: '/api/user/'+content.user+'/profile',
        success: resp => {
            if (resp) {
                const friendImg = !resp.profile_picture ? '/static/img/bg-img/img-default.png' : resp.profile_picture
                isOnl = userOnline.indexOf(resp.id) > -1;
                if (isOnl) {
                    register_popup(resp.id, resp.nickname, content.message.roomID, friendImg, isOnl)
                }
                $(`#popup-messages-${content.message.roomID} .user-typing`).empty();
                $(`#popup-messages-${content.message.roomID}`).append(`
                    <div class="chat-message">
                        <img class='avt-chat-message' src="${friendImg}"/>
                        <span class="friends-message">${content.message.message}</span>
                    </div>
                `);
                $(`#popup-messages-${content.message.roomID}`).animate(
                    {
                        scrollTop: $(`#popup-messages-${content.message.roomID}`).offset().top
                    },
                    'fast'
                );
            }
        },
        error: resp => {
            if (resp.status === 404) {
                console.log(resp);
            } else {
                alert('Internal server error! Please try again later.');
            }
        }
    });
});

socket.on('userTyping', data => {
    content = JSON.parse(data);
    $.get({
        url: '/api/user/'+content.user+'/profile',
        success: resp => {
            if (resp) {
                $(`#popup-messages-${content.room}`).animate(
                    {
                        scrollTop: $(`#popup-messages-${content.room}`).offset().top
                    },
                    'fast'
                );
                const friendImg = !resp.profile_picture ? '/static/img/bg-img/img-default.png' : resp.profile_picture
                $(`#popup-messages-${content.room}`).append(`
                    <div class="user-typing">
                        <img class='avt-chat-message' src="${friendImg}" '/> is typing...
                    </div>
                `);
            }
        },
        error: resp => {
            if (resp.status === 404) {
                console.log(resp);
            } else {
                alert('Internal server error! Please try again later.');
            }
        }
    });
    
});

socket.on('userNotTyping', data => {
    content = JSON.parse(data);
    $(`#popup-messages-${content.room} .user-typing`).empty();
});

//this function can remove a array element.
Array.remove = function(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

//this variable represents the total number of popups can be displayed according to the viewport width
var total_popups = 0;

//arrays of popups ids
var popups = [];

//this is used to close a popup
function closePopup(id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            Array.remove(popups, iii);
            $(`#${id}`).remove();
            calculate_popups();
            return;
        }
    }
}

//this is used to close a popup
function hiddenPopup(id) {
    popupHeight = $(`#${id}`).css('height');
    if (popupHeight == '32px') {
        $(`#${id}`).css('height', '285px');
    } else {
        $(`#${id}`).css('height', '32px');
    }
}

function register_popup(id, name, room_id, profile_image, isOnl) {
    
    for (var iii = 0; iii < popups.length; iii++) {
        //already registered. Bring it to front.
        if (id == popups[iii]) {
            Array.remove(popups, iii);
            popups.unshift(id);
            calculate_popups();
            return;
        }
    }
    userInfo = JSON.parse(localStorage.authInfo);
    var element = `
    <div class="popup-box" id="${id}">
        <div class="popup-head" id="btn-popup-head" onclick="hiddenPopup(${id});">
            <div class="popup-head-left">
                <img class='friend-profile-picture rounded-circle' src='${profile_image}'> ${name}
                <p class='${isOnl ? 'user-online' : 'user-offline'}' style><i class='fas fa-circle'></i> 
            </div>
            <div class="popup-head-right">
                <a href="javascript:closePopup('${id}');">&#10005;</a>
            </div>
            <div style="clear: both"></div>
        </div>
        <div class="popup-messages" id='popup-messages-${room_id}'>
        </div>
        <input class="popup-input" type="text" id='input-${id}'>
    </div>`;

    loadMsg(id, name, room_id, profile_image);
    $('body').append(element);
    popups.unshift(id);
    calculate_popups();
    sendMsg(id, name, room_id, profile_image, socket);
    myFocusin(id, room_id);
    myFocusout(id, room_id);
}

//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
function display_popups() {
    var right = 220;

    var iii = 0;
    for (iii; iii < total_popups; iii++) {
        if (popups[iii] != undefined) {
            var element = document.getElementById(popups[iii]);
            element.style.right = right + 'px';
            right = right + 320;
            element.style.display = 'block';
        }
    }

    for (var jjj = iii; jjj < popups.length; jjj++) {
        var element = document.getElementById(popups[jjj]);
        element.style.display = 'none';
    }
}

//calculate the total number of popups suitable and then populate the toatal_popups variable.
function calculate_popups() {
    var width = window.innerWidth;
    if (width < 540) {
        total_popups = 0;
    } else {
        width = width - 200;
        //320 is width of a single popup box
        total_popups = parseInt(width / 320);
    }

    display_popups();
}

function showName(name) {
}

function sendMsg(id, name, room_id, profile_image, socket) {
    $(`#input-${id}`).keyup(e => {
        var input = $(`#input-${id}`);
        var keycode = e.keyCode ? e.keyCode : e.which;
        var inputMessage = input.val().trim();
        if (keycode == '13' && inputMessage) {
            socket.emit('clientSendMessage', {
                message: inputMessage,
                roomID: room_id
            });
            input.val('');
            myFocusout(id);
            $(`#popup-messages-${room_id}`).append(
                `<div class="chat-message" style="text-align:right;">
                    <span class="self-message">${inputMessage}</span>
                </div>`
            );
            $(`#popup-messages-${room_id}`).animate(
                {
                    scrollTop: $(`#popup-messages-${room_id}`).offset().top
                },
                'fast'
            );
        }
    });
}

function loadMsg(id, name, room_id, profile_image) {
    $.get({
        url:
            'http://localhost:3002/api/messages/' +
            room_id +
            '?limit=10&since_id=0',
        headers: {
            chat_token: 'Bearer ' + localStorage.tokenChat
        },
        success: resp => {
            let content = '';
            value = JSON.parse(resp);
            if (value.length > 0) {
                value.forEach(element => {
                    if (userInfo.id == element.user_id) {
                        content =
                            `<div class="chat-message" style="text-align:right;">
                                <span class=" self-message">${
                                    element.message
                                }</span>
                            </div>` + content;
                    } else {
                        content =
                            `<div class="chat-message">
                                <img class='avt-chat-message' src="${profile_image}"'/>
                                <span class="friends-message">${
                                    element.message
                                }</span>
                            </div>` + content;
                    }
                });
                $(`#popup-messages-${room_id}`).html(content);
                $(`#popup-messages-${room_id}`).animate(
                    {
                        scrollTop: $(`#popup-messages-${room_id}`).prop(
                            'scrollHeight'
                        )
                    },
                    500
                );
            }
        },
        error: resp => {
            console.log(resp);
            
            alert('Internal sever error! Please try again later!');
        }
    });
}

function myFocusin(id, room_id) {
    userInfo = JSON.parse(localStorage.authInfo);
    $(`#input-${id}`).focusin( () => {
        socket.emit('isTyping', {
            user: userInfo.id,
            room: room_id
        })
    });
}
function myFocusout(id, room_id) {
    userInfo = JSON.parse(localStorage.authInfo);
    $(`#input-${id}`).focusout( () => {
        socket.emit('notTyping', {
            user: userInfo.id,
            room: room_id
        })
    });
}

//recalculate when window is loaded and also when window is resized.
window.addEventListener('resize', calculate_popups);
window.addEventListener('load', calculate_popups);
