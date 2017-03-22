require('../_support/utils/ServicesUtil');

describe('Services', function () {

  /**
   * Test the applications
   */
  describe('Applications', function () {

    beforeEach(function () {
      cy
        .visitUrl(`services/overview/%2F${Cypress.env('TEST_UUID')}/create`);
    });

    function selectMesosRuntime() {
      cy
        .contains('More Settings')
        .click();
      cy
        .contains('Mesos Runtime')
        .click();
    }

    it('Create a simple app', function () {
      const serviceName = 'app-with-inline-shell-script';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .contents()
        .asJson()
        .should('deep.equal', [{
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'cmd': cmdline,
          'cpus': 0.1,
          'mem': 10,
          'instances': 1
        }]);

      // Click Review and Run
      cy
        .contains('Review & Run')
        .click();

      // Verify the review screen
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Service ID')
        .contains(`/${Cypress.env('TEST_UUID')}/${serviceName}`);
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Runtime')
        .contains('Mesos Runtime');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('CPU')
        .contains('0.1');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Memory')
        .contains('10 MiB');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Disk')
        .contains('Not Configured');

      // Run service
      cy
        .get('button.button-primary')
        .contains('Run Service')
        .click();

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .contains(serviceName)
        .should('exist');

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .should('exist');

    });

    it('Create an app with artifacts', function () {
      const serviceName = 'app-with-artifacts';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Use some artifacts
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.0.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/1');
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.1.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/2');
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.2.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/3');

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .contents()
        .asJson()
        .should('deep.equal', [{
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'cmd': cmdline,
          'cpus': 0.1,
          'mem': 10,
          'instances': 1,
          'fetch': [
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/1'
            },
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/2'
            },
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/3'
            }
          ]
        }]);

      // Click Review and Run
      cy
        .contains('Review & Run')
        .click();

      // Verify the review screen
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Service ID')
        .contains(`/${Cypress.env('TEST_UUID')}/${serviceName}`);
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Runtime')
        .contains('Mesos Runtime');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('CPU')
        .contains('0.1');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Memory')
        .contains('10 MiB');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Disk')
        .contains('Not Configured');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Image')
        .contains('Not Supported');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Command')
        .contains(cmdline);
      cy
        .root()
        .configurationSection('Container Artifacts')
        .children('table')
        .getTableColumn('Artifact URI')
        .contents()
        .should('deep.equal', [
          'http://lorempicsum.com/simpsons/600/400/1',
          'http://lorempicsum.com/simpsons/600/400/2',
          'http://lorempicsum.com/simpsons/600/400/3'
        ]);

      // Run service
      cy
        .get('button.button-primary')
        .contains('Run Service')
        .click();

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .contains(serviceName)
        .should('exist');

    });

  });

});
