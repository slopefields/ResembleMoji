const imageUpload = document.getElementById('imageUpload');
const imageDisplay = document.getElementById('imageDisplay');
const predictButton = document.getElementById('predictButton');

const reader = new FileReader();

async function loadModel()
{
    const model = await mobilenet.load();
    console.log("MobileNet model successfully loaded");
};

imageUpload.addEventListener('change', function()
{
    // Get first file (only one image is allowed)
    const file = imageUpload.files[0];
    // If null or undefined, exit function
    if (!file) return;
    // Read file as a Data URL so it can be used as the source for the <img> tag
    reader.readAsDataURL(file);
});

reader.addEventListener("load", () =>
{
    // Change imageDisplay's src to the file data, or Data URL (only happens after readAsDataURL is loaded)
    imageDisplay.src = reader.result;
});

predictButton.addEventListener('click', function()
{
    // If there are no files (length == 0)
    if (!imageUpload.files.length)
    {
        alert('Attach an image first!');
    }
});

window.onload = function()
{
    loadModel();
};