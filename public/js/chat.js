const socket = io();
const textForm = document.querySelector('form');

// Elements 
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $location = document.querySelector('#send-location');
const $locationButton = $location.querySelector('button');

const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    console.log('print message', message);
    const html = Mustache.render(messageTemplate, { 
        username: message.username,
        message: message.message,
        createdAt: moment(message.createdAt).format('h:mm:a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

socket.on('locationMessage', (location)=> {
    console.log('Print location', location);
    const html = Mustache.render(locationTemplate, { 
        username: location.username,
        location: location.message,
        createdAt: moment(location.createdAt).format('h:mm:a')
     });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, user }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        user
    });
    document.querySelector('#sidebar').innerHTML(html);
});

$messageForm.addEventListener('submit', (event)=> {
    event.preventDefault();
    // disable
    $messageFormButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', document.querySelector('input').value, (error) => {
        // enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }
        console.log('Message was delivered!');
    });
});

$location.addEventListener('click', ()=> {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by user browser');
    }

    // disable
    // $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=> {
        console.log(position);
        const { latitude, longitude } = position.coords;

        socket.emit('sendLocation', {
            latitude, 
            longitude
        }, (error) => {
            if(error) {
                return console.log(error);
            }
            console.log('Message was delivered!');
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    console.log(error);
});
 