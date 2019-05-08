$(document).ready(function() {
    if (localStorage.authToken) {
        authInfo();
    }
    $('.btn-discover').click(function(e) {
        e.preventDefault();
        getDiscoverSetting();
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

    $('#btn-logout').click(() => {
        localStorage.clear();
        location.reload(true);
    });

    $('#btn-profile-setting').click(e => {});
});

function getDiscoverSetting() {
    $.ajax({
        url: '/api/discover/setting',
        type: 'get',
        success: res => {
            console.log(res)
        },
        error: res => {
            if (res.status == 404) {
                console.log('404')
            }
        }
    })
}

function discover(request) {
    $('html,body').animate(
        {
            scrollTop: $('.discover-area').offset().top
        },
        'slow'
    );
    $('#loading-views').fadeOut();
    // $('.discover-box').each(function(index) {
    //     $(this).css(
    //         'background-image',
    //         'url(https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1409104845898313&height=500&width=500&ext=1559792512&hash=AeROdJjv7X881vo7)'
    //     );
    // });

    $.ajax({
        url: '/api/users/discover',
        type: 'get',
        data: request,
        success: r => {
            console.log(r);
        },
        error: e => {
            console.log(e);
        }
    });
}

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
            Hi, ${userInfo.username}
            <img class='rounded-circle' src='${
                userInfo.profile_picture
            }' alt='user-img'>
        </a>
        <ul class="dropdown" id="auth-logout">
            <li class="dropdown-item"><a href="">Profile</a></li>
            <li class="dropdown-item"><a href="">Logout</a></li>
        </ul>`
        )
        .show();
}

function requestSetting() {
    token = JSON.parse(localStorage.authToken);
    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
    });
}
