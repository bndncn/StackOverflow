$(document).ready(function() {

    $('#adduser').submit(function (ev) {
        ev.preventDefault();
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/adduser',
            
            success: function(response) {
                document.open();
                document.write(response);
                document.close();
            },

            error: function(xhr) {
                alert('Account credentials already used');
            }

        });
    });

    $('#verify').submit(function () {
        ev.preventDefault();
        $.ajax({
            type: 'GET',
            url: '/ui/verify',
            success: function(response) {
                $("html").html(response);
            }
        });
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/../verify',
        });
    });
    
    $('#login').submit(function () {
        $.ajax({
            type: 'POST',
            data : $(this).serialize(),
            url: '/../login'
        });
    });
});