(async () => {
    try {
        require('dotenv').config();
        const mongoose = require('mongoose');
        const Message = require('./models/Message');

        await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
        });

        const { Server } = require('ws');
        const wss = new Server({
            port: 8080
        });

        // on check la connexion au serveur websocket
        // il prend en argument cette connexion (socket)
        wss.on('connection', async (socket) => {
            console.log('Un nouveau client s\'est connecté !');
            const messages = await Message.find();

            socket.send(JSON.stringify({
                event: 'history',
                messages:messages
            }));
            // dès que send() est utilisé de l'autre côté, alors fait ça...
            socket.on('message', async (msg) => {
                // ici on envoie au client qui a établit la connexion le message qu'il a envoyé
                // ce n'est pas ce qu'on veut car on souhaite envoyer à TOUS LES CLIENTS
                // socket.send(msg);
                console.log(msg);
                // insère le message dans la base
                await Message.create(JSON.parse(msg));
                // puis envoie à chaque client le message
                for(const client of wss.clients) {
                    // je veux envoyer à chaque client le message
                    client.send(JSON.stringify({
                        event: 'sendMessage',
                        msg:msg
                    }));
                }
            });
        });
    } catch(error) {
        console.error(error);
    }
    
})();

