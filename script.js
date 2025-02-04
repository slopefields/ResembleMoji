const predictButton = document.getElementById('predictButton');

predictButton.addEventListener('click', function()
{
    if (imageUpload.value == '')
        alert('Attach an image first!');
});
