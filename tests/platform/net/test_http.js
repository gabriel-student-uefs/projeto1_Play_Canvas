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

        let requests = 0;
        xhr.onCreate = function (xhr) {
            setTimeout(function () {
                if (++requests === 3) {
                    xhr.respond(200, { ContentType: 'application/json' }, JSON.stringify({ test: "value" }));
                } else {
                    xhr.error();
                }
            });
        };

        pc.http.get('/someurl.json', {
            retry: true,
            maxRetries: 2
        }, function (err, data) {
            expect(err).to.equal(null);
            expect(pc.http.request.callCount).to.equal(3);
            expect(data).to.deep.equal({ test: "value" });
            done();
        });
    });

    it('status 0 returns "Network error"', function (done) {
        xhr.onCreate = function (xhr) {
            setTimeout(function () {
                xhr.error();
            });
        };

        pc.http.get('/someurl.json', function (err, data) {
            expect(err).to.equal('Network error');
            done();
        });
    });
});