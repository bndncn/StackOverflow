$(document).ready(function() {
    $('#loginbtn').css('cursor', 'pointer');
    $('#signupbtn').css('cursor', 'pointer');
    $('#verifybtn').css('cursor', 'pointer');
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

    $('#login').submit(function(ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/login',
            
            success: function(response) {
                $('#loginModal').modal('hide');
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
            
            success: function(response) {
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
                alert(JSON.parse(xhr.responseText).error);
            }

        });
    });
});