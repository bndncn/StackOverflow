$(document).ready(function() {
    $('#loginbtn').css('cursor', 'pointer');
    $('#signupbtn').css('cursor', 'pointer');
    $('#verifybtn').css('cursor', 'pointer');
    $('#user').css('cursor', 'pointer');
    $('#questions').css('cursor', 'pointer');
    $('#logout').css('cursor', 'pointer');

    $('#loginbtn').click(function() {
        $('#loginModal').modal('show');
    });

    $('#signupbtn').click(function() {
        $('#signupModal').modal('show');
    });

    $('#verifybtn').click(function() {
        $('#verifyModal').modal('show');
    });
    
    $('#adduser').submit(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/adduser',
            
            success: function(response) {
                $('#signupModal').modal('hide');
                alert('Sign up was successful');
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
            }
        });
    });


    let pages = ['home', 'questions'];
    function getCurrentPage() {
        let currentPage = null;
        for (let i = 0; i < pages.length; i++) {
            if ($('#' + pages[i]).hasClass('active')) {
                currentPage = pages[i];
                break;
            }
        }
        if (currentPage) {
            $.ajax({
                type: 'GET',
                url: '/',
                data: {
                    currentPage
                },
                
                success: function(response) {
                    console.log(response)   
                    $('#navbar').html(response);
                    $.getScript('../../controllers/form_controller.js');
                    setActivePage(currentPage);
                }        
            });
        }
    }

    function setActivePage(currentPage) {
        for (let i = 0; i < pages.length; i++) {
            if ($('#' + pages[i]).hasClass('active')) {
                $('#' + pages[i]).removeClass('active');
            }
        }
        $('#' + currentPage).addClass('active');
    }

    $('#login').submit(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/login',
            
            success: function() {
                $('#loginModal').modal('hide');
                getCurrentPage();
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
            }
        });
    });
    
    $('#verify').submit(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/verify',
            
            success: function(response) {
                $('#verifyModal').modal('hide');
                alert('Account successfully verified');
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
            }
        });
    });

    $('#logout').click(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/logout',
            
            success: function() {
                getCurrentPage();
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
            }

        });
    });

    $('#questions').click(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/search',
            
            success: function(response) {
                $.ajax({
                    type: 'POST',
                    url: '/questions',
                    data: {
                        questions: JSON.stringify(response.questions)
                    },  
                    
                    success: function(response) {
                        $('body').html(response);
                        setActivePage('questions');
                    }   
                });
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
            }

        });
    });

    $('#q-add').submit(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/questions/add',
            
            success: function(response) {
                console.log(response)
            },

            error: function(xhr) {
                alert(JSON.parse(xhr.responseText).error);
                $('#q-add')[0].reset();
            }

        });
    });
});