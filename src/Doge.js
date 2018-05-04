const LogService = require("matrix-js-snippets").LogService;
const WordPOS = require("wordpos");

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

class NounHandler {

    constructor() {
        this._wordpos = new WordPOS({profile: false, stopwords: true});
    }

    start(client) {
        this._client = client;

        this._client.on('event', (event) => {
            if (event.getType() !== 'm.room.message') return;
            if (event.getSender() === client.credentials.userId) return;
            if (event.getContent().msgtype !== 'm.text') return;

            const content = event.getContent();
            if(content.body !== undefined)
                this.processMessage(event.getRoomId(), content.body);
        });

        this.triggers = [ "doge", "wow", "much", "many", "such" ];

        this.prefixes = [ "wow", "much", "so", "very", "many", "how", "such", "great", "amaze", "pls no" ];
    }

    processMessage(roomID, message) {

        let match = false;
        for(let trigger of this.triggers){
            if(message.toLowerCase().indexOf(trigger) >= 0){
                match = true;
                break;
            }
        }
        if(match === true){

            this._wordpos.getNouns(message, nounList => {

                if(nounList.length === 0) return;

                nounList = shuffle(nounList);
                this.prefixes = shuffle(this.prefixes);

                let answer = "";
                for(let i = 0 ; i < nounList.length && i < 2 ; i++){
                    answer += (i !== 0 ? ", " : "") + `${this.prefixes[i]} ${nounList[i].toLowerCase()}`;
                }
                console.log("answer", answer);
                this._client.sendNotice(roomID, answer);
            });

        }
    }

}

module.exports = new NounHandler();