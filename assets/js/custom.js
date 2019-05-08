$(document).ready(function() {
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

    $('#btn-logout').click(e => {
        localStorage.clear();
        location.reload(true);
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
                if (resp.status === 400) {
                    let errors = resp.responseJSON.errors;
                    errors.forEach(element => {
                        $('#err-' + element.param + '-setting')
                            .html(element.msg)
                            .show();
                    });
                } else {
                    alert('Internal server error! Please try again later.');
                }
            }
        });
    });

    $('#btn-add-friend').click(e => {
        $.post({
            url: '/api/user/friend',
            data: {
                username: ''
            },
            success: resp => {
            },
            error: resp => {
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
    $('#auth-sigin')
        .html(
            `<a href=''>
            Hi, ${userInfo.username}
            <img class='rounded-circle' src='${
                userInfo.profile_picture
            }' alt='user-img'>
        </a>`
        )
        .show();
    $('#auth-signup ul').removeAttr('style');
    $('#auth-signup ul').append(
        `<li><a class="text-center" href="">Profile</a></li>
        <li id="btn-logout"><a class="text-center" href="">Logout</a></li>`
    );
}

function requestSetting() {
    token = JSON.parse(localStorage.authToken);
    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
    });
}
