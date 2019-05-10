$(document).ready(function() {
    if (localStorage.authToken) {
        authInfo();
        requestSetting();
    }
    $('.btn-discover').click(function(e) {
        e.preventDefault();
        discover();
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
                        $('#err-' + element.param)
                            .html(element.msg)
                            .show();
                    });
                } else {
                    alert('Internal server error! Please try again later.');
                }
            }
        });
    });

    $('#btn-discover-apply-setting').click(function(e) {
        const data = {
            min_age: $('#age-selector')
                .val()
                .split(',')[0],
            max_age: $('#age-selector')
                .val()
                .split(',')[1],
            location: $('#location-selector').val(),
            occupation: $('#occupation-selector').val(),
            gender: $('#gender-selector').val()
        };
        $.post({
            url: '/api/discover/setting',
            data: data,
            success: resp => {
                $('#modal-discover-setting').modal('toggle');
                discover();
            },
            error: e => {
                console.log(e);
            }
        });
    });
});

function getDiscoverSetting() {
    return $.ajax({
        url: '/api/discover/setting',
        type: 'get'
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function discover(scrollRequired) {
    $('#loading-views').html('<div class="lds-dual-ring"></div>');
    $('html,body').animate(
        {
            scrollTop: $('.discover-area').offset().top
        },
        'slow'
    );
    let dcvSetting = {};
    try {
        dcvSetting = await getDiscoverSetting();
    } catch (error) {
        if (error.status == 404) {
            $('#modal-discover-setting .modal-body .text-center')
                .html(
                    `<p class="alert alert-info">The first, you need fill some information for this feature.</p>`
                )
                .hide()
                .show()
                .delay(3000)
                .slideUp();
            $('#modal-discover-setting').modal('show');
        }
        return;
    }

    try {
        dcvSetting.limit = 10;
        dcvSetting.page = 1;
        const response = await getUserDiscover(dcvSetting);
        if (response.results.length > 0) {
            $('#notifi-opps').hide();
        } else {
            $('#notifi-opps').show();
        }
        setUsersDiscover(response.results);
        $('#dis-setting-gender').html(
            `<i class="fa fa-venus-mars"></i>
            ${response.req.gender}`
        );
        $('#dis-setting-age').html(
            `${response.req.min_age} - ${response.req.max_age}`
        );
        $('#dis-setting-occupation').html(`${response.req.occupation}`);
        $('#dis-setting-location').html(`${response.req.location}`);

        await sleep(1000);
        $('#loading-views').html(
            `<h5 style='font-size: 27px; padding: 12.5px;'>${
                response.total_count
            }<small>(matching)</small></h5>`
        );
    } catch (error) {
        console.log(error.res);
    }
}

// function discoverBarS
function setUsersDiscover(users) {
    $('.discover-box').each(function(index) {
        if (users[index]) {
            // console.log(users[index]);
            let user = users[index];
            $(this).css('position', 'relative');
            $(this).css('background-image', `url(${user.profile_picture})`);
            $(this).find('.hover-text').html(`
                <h5 style='position: absolute; right: 13px; top: 5px;'><a href='' class='text-light btn-close-discover-item'>x</a></h5>
                ${user.nickname ? `<h4>${user.nickname}</h4>` : ''}
                ${user.gender ? `<h6>Gender: ${user.gender}</h6>` : ''}
                ${user.age ? `<h6>Age: ${user.age}</h6>` : ''}
                ${
                    user.occupation
                        ? `<h6>Occupation: ${user.occupation}</h6>`
                        : ''
                }
                ${user.ethnic ? `<h6>Ethnic: ${user.ethnic}</h6>` : ''}
                ${user.location ? `<h6>Location: ${user.location}</h6>` : ''}`);
            $(this)
                .children('.user-id')
                .html(user.id);
            $(this).show();

            $(this).dblclick(function() {
                $(this).html(`<div class='heart relative-center'></div>`);
                $(this)
                    .find('.heart')
                    .animate({ zoom: '1%', left: '49%', top: '49%' }, 0)
                    .animate(
                        { zoom: '100%', left: '30%', top: '35%' },
                        'normal'
                    )
                    .delay(0)
                    .fadeOut();
                $(this).fadeOut();
                postDiscoverItem(user.id);
                discover();
            });
        } else {
            $(this).hide();
        }
    });

    $('.btn-close-discover-item').click(function(e) {
        e.preventDefault();
        $(this)
            .parents('.discover-box')
            .hide();
        const userID = $(this)
            .parents('.discover-box')
            .find('.user-id')
            .html();
        postDiscoverItem(userID);
    });
}

function postDiscoverItem(userID) {
    $.post({
        url: '/api/discover/user',
        data: {
            user_id: userID
        },
        success: resp => {
            discover();
        },
        error: e => {
            console.log(e);
        }
    });
}
function getUserDiscover(request) {
    return $.ajax({
        url: '/api/users/discover',
        type: 'get',
        data: request
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
