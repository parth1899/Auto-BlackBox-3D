$(document).ready(function () {
    $('#upload-form').submit(function (event) {
        event.preventDefault();
        var formData = new FormData(this);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    data = response;
                    console.log(data);
                    window.location.href = '/models'; // Redirect to the models page
                }
            },
            error: function () {
                alert('An error occurred while uploading the file.');
            }
        });
    });
});
