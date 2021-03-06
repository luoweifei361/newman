var fs = require('fs'),
    path = require('path');

/* global beforeEach, afterEach, describe, it, expect, newman */
describe('--export-environment', function () {
    var environment = 'test/fixtures/run/simple-variables.json',
        exportedEnvironmentPath = path.join(__dirname, '..', '..', 'out', 'test-environment.json');

    beforeEach(function (done) {
        fs.stat('out', function (err) {
            if (err) { return fs.mkdir('out', done); }

            done();
        });
    });

    afterEach(function (done) {
        fs.stat(exportedEnvironmentPath, function (err) {
            if (err) { return done(); }

            fs.unlink(exportedEnvironmentPath, done);
        });
    });

    it('`newman run` should export environment to a file', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            environment: environment,
            exportEnvironment: exportedEnvironmentPath
        }, function (err) {
            if (err) { return done(err); }

            var environment;

            try { environment = JSON.parse(fs.readFileSync(exportedEnvironmentPath).toString()); }
            catch (e) { console.error(e); }

            expect(environment).be.ok();
            expect(environment).have.property('_postman_exported_at');
            expect(environment).have.property('values');
            expect(environment.values).eql([
                { key: 'var-1', value: 'value-1', type: 'any' },
                { key: 'var-2', value: 'value-2', type: 'any' }
            ]);
            expect(environment).have.property('_postman_variable_scope', 'environment');
            done();
        });
    });

    it('`newman run` should export environment to a file even if collection is failing', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-request-failing.json',
            environment: environment,
            exportEnvironment: exportedEnvironmentPath
        }, function (err) {
            if (err) { return done(err); }

            var environment;

            try { environment = JSON.parse(fs.readFileSync(exportedEnvironmentPath).toString()); }
            catch (e) { console.error(e); }

            expect(environment).be.ok();
            expect(environment).have.property('_postman_exported_at');
            expect(environment).have.property('values');
            expect(environment.values).eql([
                { key: 'var-1', value: 'value-1', type: 'any' },
                { key: 'var-2', value: 'value-2', type: 'any' }
            ]);
            expect(environment).have.property('_postman_variable_scope', 'environment');
            done();
        });
    });

    it('`newman run` should export env with a name if the input file doesn\'t have one', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-request-failing.json',
            environment: {
                values: [{ key: 'var-1', value: 'value-1' }]
            },
            exportEnvironment: exportedEnvironmentPath
        }, function (err) {
            if (err) { return done(err); }

            var environment;

            try { environment = JSON.parse(fs.readFileSync(exportedEnvironmentPath).toString()); }
            catch (e) { console.error(e); }

            expect(environment).be.ok();
            expect(environment).have.property('_postman_exported_at');
            expect(environment).have.property('values');
            expect(environment).have.property('name', 'environment');
            expect(environment.values).eql([
                { key: 'var-1', value: 'value-1', type: 'any' }
            ]);
            expect(environment).have.property('_postman_variable_scope', 'environment');
            done();
        });
    });

    it('`newman run` should export environment with a name when no input file is provided', function (done) {
        newman.run({
            collection: {
                item: [{
                    event: [{
                        listen: 'test',
                        script: 'pm.environment.set("var-1", "value-1");'
                    }],
                    request: 'https://postman-echo.com/get?source=newman-sample-github-collection'
                }]
            },
            exportEnvironment: exportedEnvironmentPath
        }, function (err) {
            if (err) { return done(err); }

            var environment;

            try { environment = JSON.parse(fs.readFileSync(exportedEnvironmentPath).toString()); }
            catch (e) { console.error(e); }

            expect(environment).be.ok();
            expect(environment).have.property('_postman_exported_at');
            expect(environment).have.property('values');
            expect(environment).have.property('name', 'environment');
            expect(environment.values).eql([
                { key: 'var-1', value: 'value-1', type: 'any' }
            ]);
            expect(environment).have.property('_postman_variable_scope', 'environment');
            done();
        });
    });
});
