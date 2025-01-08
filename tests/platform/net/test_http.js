const { expect } = require('chai');
const sinon = require('sinon');
const pc = require('playcanvas'); // Assuming playcanvas is the library being tested

describe('pc.Http', function () {
    let retryDelay;
    let xhr;

    beforeEach(function () {
        retryDelay = pc.Http.retryDelay;
        pc.Http.retryDelay = 1;
        xhr = sinon.useFakeXMLHttpRequest();
    });

    afterEach(function () {
        pc.Http.retryDelay = retryDelay;
        xhr.restore();
        sinon.restore();
    });

    it('get() retries resource and returns result if eventually found', function (done) {
        sinon.spy(pc.http, 'request');

        const responses = [
            { status: 0, responseText: '' }, // First attempt fails
            { status: 0, responseText: '' }, // Second attempt fails
            { status: 200, responseText: JSON.stringify({ test: "value" }) } // Third attempt succeeds
        ];

        let requestIndex = 0;
        xhr.onCreate = function (xhr) {
            setTimeout(function () {
                const response = responses[requestIndex++];
                if (response.status === 200) {
                    xhr.respond(response.status, { ContentType: 'application/json' }, response.responseText);
                } else {
                    xhr.error();
                }
            });
        };

        pc.http.get('/someurl.json', {
            success: function (data) {
                expect(data.test).to.equal('value');
                done();
            },
            error: function () {
                done(new Error('Request failed'));
            }
        });
    });
});