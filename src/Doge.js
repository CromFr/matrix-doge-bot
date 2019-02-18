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

            const content = event.getContent();

            if (event.getContent().msgtype !== 'm.text') return;
            if (content["m.relates_to"] !== undefined && content["m.relates_to"]["m.in_reply_to"] !== undefined) return;

            if(content.body !== undefined)
                this.processMessage(event.getRoomId(), content.body);
        });

        this.trigger = new RegExp(/\b(doge|wow|much|many|such)\b/i);

        this.prefixes = [ "wow", "much", "so", "very", "many", "how", "such", "great", "amaze", "pls no", "mighty" ];
    }

    processMessage(roomID, message) {
        if(message.match(this.trigger) !== null){
            this._wordpos.getNouns(message, nounList => {
                nounList = nounList.filter(noun => noun.length > 1)
                if(nounList.length === 0) return;

                nounList = shuffle(nounList);
                this.prefixes = shuffle(this.prefixes);

                let answer = "";
                for(let i = 0 ; i < nounList.length && i < 2 ; i++){
                    answer += (i !== 0 ? ", " : "") + `${this.prefixes[i]} ${nounList[i].toLowerCase()}`;
                }

                this._client.sendNotice(roomID, answer);
            });

        }
    }

}

module.exports = new NounHandler();