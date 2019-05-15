$(document).ready(function() {
    registerFpopup(0, 'Friend(4)');
    if (localStorage.authToken) {
        authInfo();
        requestSetting();
    }
    $('.btn-discover').click(function(e) {
        e.preventDefault();
        $('html,body').animate(
            {
                scrollTop: $('.discover-area').offset().top
            },
            'slow'
        );
    });
    $('#btn-signin').click(e => {
        e.preventDefault();
        $('#modal-login').modal('show');
    });

    $('#btn-setting-item').click(e => {
        e.preventDefault();
        $('#modal-discover-setting').modal('show');
    });

    // With JQuery
    $('#age-selector').slider({});

    $('#age-selector').on('change', e => {
        $('#age-select-area').html(`[${$(e.target).val()}]`);
    });

    $('#btn-profile').click(e => {
        e.preventDefault();
        $('#profile-modal').modal('toggle');
        getUserProfile();
        getListFriend();
    });
    window.fbAsyncInit = function() {
        FB.init({
            appId: '2423738151191635',
            cookie: true,
            xfbml: true,
            version: 'v3.3'
        });

        FB.AppEvents.logPageView();
    };

    (function(d, s, id) {
        var js,
            fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');

    $('#btn-logout').click(() => {
        logout();
    });

    $('#btn-profile-setting').click(e => {
        $.post({
            url: '/api/profile/setting',
            data: {
                gender: $('#gender-profile-setting').val(),
                age: $('#age-profile-setting').val(),
                location: $('#location-profile-setting').val(),
                occupation: $('#occupation-profile-setting').val(),
                income_level: $('#income-level-profile-setting').val(),
                ethnic: $('#ethnic-profile-setting').val()
            },
            success: resp => {
                $('#modal-new-user-setting').modal('hide');
                $('html,body').animate(
                    {
                        scrollTop: $('.discover-area').offset().top
                    },
                    'slow'
                );
            },
            error: resp => {
                switch (resp.status) {
                    case 400:
                        let errors = resp.responseJSON.errors;
                        errors.forEach(element => {
                            $('#err-' + element.param)
                                .html(element.msg)
                                .show();
                        });
                        break;
                    case 401: 
                        logout();
                        break
                    default:
                        alert('Internal server error! Please try again later.');
                        break;
                }
            }
        });
    });
});

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $.post({
                url: '/api/facebook/profile',
                data: {
                    access_token: response.authResponse.accessToken
                },
                success: resp => {
                    localStorage.authToken = JSON.stringify(resp.token);
                    localStorage.authInfo = JSON.stringify(resp.user);
                    authInfo();
                    requestSetting();
                    $('#modal-login').modal('hide');
                    if (resp.is_new) {
                        $('#modal-new-user-setting').modal();
                    }
                },
                error: resp => {
                    alert('Internal server error! Please try again later.');
                }
            });
        }
    });
}

function authInfo() {
    userInfo = JSON.parse(localStorage.authInfo);
    $('#auth-info')
        .html(
            `<a href=''>
            Hi, ${userInfo.nickname}
            <img class='rounded-circle' src='${
                userInfo.profile_picture
            }' alt='user-img'>
        </a>
        <ul class="dropdown" id="auth-logout">
            <li class="dropdown-item" id='btn-profile'><a href=''>Profile</a></li>
            <li class="dropdown-item" id='btn-logout'><a href="">Logout</a></li>
        </ul>`
        )
        .show();
}
function getUserProfile() {
    $.ajax({
        url: '/api/profile',
        method: 'GET',
        success: function(data) {
            $('#profile-avatar').attr('src', data['profile_picture']);
            $('#profile-modal-nickname').html(data['nickname']);
            $('#profile-modal-username').html(data['username']);
            $('#user-profile').html('');
            $('#user-profile')
                .append(`
                    <table class='table table-user-information'>
                        <tbody>
                        <tr>
                            <td>Gender:</td>
                            <td>${data['gender']}</td>
                        </tr>
                        <tr>
                            <td>Age:</td>
                            <td>${data['age']}</td>
                        </tr>
                        <tr>
                            <td>Income_level:</td>
                            <td>${data['income_level']}</td>
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td>${data['location']}</td>
                        </tr>
                        <tr>
                            <td>Occupation:</td>
                            <td>${data['occupation']}</td>
                        </tr>
                        <tr>
                            <td>Ethnic:</td>
                            <td>${data['ethnic']}</td>
                        </tr>
                        </tbody>
                    </table>
                `);
            $('#bottom').html(
                ` <span> posted ${data['created_at']} by <b>${data['nickname']}</b> </span> `
            );
        },
        error: resp => {
            if (resp.status === 401) {
                logout()
            } 
            if (resp.status === 500) {
                alert('Internal server error! Please try again later.');
            }
        }
    });
}

function getListFriend() {
    $.ajax({
        url: '/api/user/friend',
        method: 'GET',
        success: function(userFriends) {
            $('#lisfriends').html('');
            userFriends.forEach(function(userFriend) {
                const friendImg = !userFriend.profile_picture ? '/static/img/bg-img/img-default.png' : userFriend.profile_picture
                $('#lisfriends').append(`
                    <li>
                        <img class='friend-profile-picture rounded-circle' src='${friendImg}'>
                        <a><b>${userFriend.nickname}</b></a>
                        <small>${userFriend.username}</small>
                    </li>
                `);
            });
        },
        error: resp => {
            if (resp.status === 401) {
                logout()
            } 
            if (resp.status === 500) {
                alert('Internal server error! Please try again later.');
            }
        }
    });
}

function requestSetting() {
    token = JSON.parse(localStorage.authToken);
    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
    });
}

function logout() {
    localStorage.clear();
    location.reload(true);
}
