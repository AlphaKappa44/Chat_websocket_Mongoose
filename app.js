const app = {
    socket: null,
    init: () => {
        // connexion au serveur ws
        app.socket = new WebSocket('ws://localhost:8080');
        document.querySelector('form').addEventListener('submit', app.sendMessage);
        // on ne peut pas utiliser on() côté front
        app.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if(data.event === 'history') app.showHistory(data.messages);
            if(data.event === 'sendMessage') app.makeMessage(JSON.parse(data.msg));
        });
    },
    sendMessage: (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const tchatMessage = formData.get('message');
        // si le message est vide
        if(!tchatMessage) {
            // on récupère l'erreur si elle existe déjà
            const erreur = document.getElementById('erreur');
            if(!erreur) {
                const p = document.createElement('p');
                p.textContent = 'Erreur : Votre message est vide !';
                p.style.color = 'red';
                p.id = 'erreur';
                event.target.appendChild(p);
                // au bout de 3 secondes (3000 milisecondes) on supprime le p (l'erreur)
                setTimeout(() => {
                    p.remove();
                }, 3000);
            }
            
            return;
        }
        // on va envoyer le message au serveur websocket
        // send() emet l'evenement qui s'appelle "message"
        // send() n'attend qu'un seul paramètre. Si on souhaite envoyer plusieurs données, il faudra mettre un tableau ou un objet.
        app.socket.send(JSON.stringify({
            username:username,
            message:tchatMessage,
            date: new Date()
        }));
        // puis on veut delete le texte de l'input du formulaire
        document.querySelector('input[name="message"]').value = '';
        //event.target.reset();
        
    },
    makeMessage: (msg) => {
       
        const list = document.getElementById('listMessages');
        // créé <li></li>
        const li = document.createElement('li');
        
        // <li>message</li>
        li.textContent = `${msg.username} : ${msg.message}`;
        // insère le li dans le ul du DOM
        list.appendChild(li);
    },
    showHistory: (messages) => {
        
        for(const msg of messages) {
            console.log(msg);
            app.makeMessage(msg);
        }
    }
}

document.addEventListener('DOMContentLoaded', app.init);