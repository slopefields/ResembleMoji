const imageUpload = document.getElementById('imageUpload');
const imageDisplay = document.getElementById('imageDisplay');
const predictButton = document.getElementById('predictButton');

const reader = new FileReader();
    
imageUpload.addEventListener('change', function()
{
    const file = imageUpload.files[0];
    if (!file) return;
    reader.readAsDataURL(file);
});

reader.addEventListener("load", () =>
{
    imageDisplay.src = reader.result;
});

predictButton.addEventListener('click', function()
{
    if (imageUpload.value == '')
        alert('Attach an image first!');
});
