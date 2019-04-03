const {
    apiai
} = require('../keys');
const ApiAi = require('apiai');
const APIAI_API_KEY = apiai.appkey;
const brainApiAi = ApiAi(APIAI_API_KEY, {
    language: 'zh-CN'
})
const {
    log,
} = require('wechaty');

module.exports = function (text, ssid) {
    return new Promise((resolve, reject) => {
        brainApiAi.textRequest(text, {
                sessionId: ssid
            })
            .on('response', function (response) {
                console.log(response)
                /*
{ id: 'a09381bb-8195-4139-b49c-a2d03ad5e014',
  timestamp: '2016-05-27T17:22:46.597Z',
  result:
   { source: 'domains',
     resolvedQuery: 'hi',
     action: 'smalltalk.greetings',
     parameters: { simplified: 'hello' },w
     metadata: {},
     fulfillment: { speech: 'Hi there.' },
     score: 0 },
  status: { code: 200, errorType: 'success' } }
          */
                const reply = response.result.fulfillment.speech
                if (!reply) {
                    log.info('ApiAi', `Talker do not want to talk for "${text}"`)
                    return reject()
                }
                log.info('ApiAi', 'Talker reply:"%s" for "%s" ', reply, text)
                return resolve(reply)
            })
            .on('error', function (error) {
                log.error('ApiAi', error)
                reject(error)
            })
            .end();
    });
}