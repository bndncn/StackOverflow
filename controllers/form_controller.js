$(document).ready(function() {
    $('#loginbtn').css('cursor', 'pointer');
    $('#signupbtn').css('cursor', 'pointer');
    $('#verifybtn').css('cursor', 'pointer');

    $('#loginbtn').click(function() {
        $('#loginModal').modal('show');
    });

    $('#signupbtn').click(function() {
        $('#signupModal').modal('show');
    });

    $('#verifybtn').click(function() {
        $('#verifyModal').modal('show');
    });
    
    $('#adduser').submit(function (ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/adduser',
            
            success: function(response) {
                alert('Sign up was successful');
            },

            error: function(xhr) {
                alert('Account credentials already used');
            }
        });
        $('#signupModal').modal('hide');
    });

    $('#login').submit(function (ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/login',
            
            success: function(response) {
                alert('Login was successful');
                $.ajax({
                    type: 'GET',
                    url: '/',
                    
                    success: function(response) {
                        document.open();
                        document.write(response);
                        document.close();
                    }        
                });
            },

            error: function(xhr) {
                alert('Wrong login information');
            }
        });
        $('#loginModal').modal('hide');
    });
    
    $('#verify').submit(function (ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/verify',
            
            success: function(response) {
                alert('Account successfully verified');
            },

            error: function(xhr) {
                alert('Email is not registered or wrong key');
            }
        });
        $('#verifyModal').modal('hide');
    });
});