@Library('sec_ci_libs') _

def master_branches = ["ic/preview/jenkins-si", ] as String[]

pipeline {
    agent {
        label 'infinity'
    }

    environment {
        CLUSTER_URL = 'http://icharalam-elasticl-atm3p900pucm-796070874.us-west-2.elb.amazonaws.com'
    }

    stages {

        //
        // Do not accept triggers from unauthorised sources
        //
        stage('Verify Author') {
            steps {
                sh 'env'
                user_is_authorized(master_branches)
            }
        }

        //
        // During the initialize step we prepare the environment so we
        //
        stage('Initialize') {
            steps {
                withCredentials(
                    [
                        usernamePassword(
                            credentialsId: 'docker-hub-credentials',
                            passwordVariable: 'DH_PASSWORD',
                            usernameVariable: 'DH_USERNAME'
                        )
                    ]
                ) {
                    echo 'Setting-up environment...'
                    sh '''docker login -u "$DH_USERNAME" -p "$DH_PASSWORD"
                    docker pull mesosphere/dcos-ui:latest'''
                }
            }
        }

        //
        // Run unit tests & build the project
        //
        stage('Lint, Unit Tests & Build') {
            steps {
                ansiColor('xterm') {
                    parallel lint: {
                        echo 'Running Lint...'
                        sh '''docker run -i --rm \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run lint
                        '''
                    }, test: {
                        echo 'Running Unit Tests...'
                        sh '''docker run -i --rm \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run test
                        '''
                    }, build: {
                        echo 'Building DC/OS UI...'
                        sh '''docker run -i --rm \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run build-assets
                        '''
                    }, failFast: true
                }
            }
            post {
                always {
                    junit 'jest/test-results/*.xml'
                }
                success {
                    stash includes: 'dist/*', name: 'dist'
                }
            }
        }

        //
        // Run integration tests
        //
        stage('Integration Tests') {
            steps {
                echo 'Running Integration Tests...'
                unstash 'dist'

                // Run a simple webserver serving the dist folder statically
                // before we run the cypress tests
                writeFile file: 'integration-tests.sh', text: [
                    'http-server -p 4200 dist&',
                    'SERVER_PID=$!',
                    'cypress run --reporter junit --reporter-options \'mochaFile=cypress/results.xml\'',
                    'kill $SERVER_PID'
                ].join('\n')

                ansiColor('xterm') {
                    sh '''docker run -i --rm --ipc=host \\
                      -v `pwd`:/dcos-ui \\
                      mesosphere/dcos-ui:latest \\
                      bash integration-tests.sh'''
                }
            }
            post {
                always {
                    junit 'cypress/results.xml'
                }
            }
        }

        //
        // Run system integration tests
        //
        stage('System Tests') {
            steps {
                echo 'Running integration tests..'
                unstash 'dist'

                // Run the `dcos-system-test-driver` locally, that will use
                // the .systemtest-dev.sh bootstrap config
                ansiColor('xterm') {
                    sh '''docker run -i --rm --ipc=host \\
                      -v `pwd`:/dcos-ui \\
                      mesosphere/dcos-ui:latest \\
                      dcos-system-test-driver -v ./.systemtest-dev.sh ${CLUSTER_URL}
                    '''
                }
            }
            post {
                always {
                    junit 'results/results.xml'
                }
            }
        }

        //
        // After we are done, we will publish the resulting dist folder to S3
        //
        stage('Publish') {
            steps {
                echo 'Publishing to S3...'
                unstash 'dist'

                ansiColor('xterm') {
                    sh 'cd dist; tar -zcf dcos-$(git rev-parse --short HEAD).tar.gz *'
                }

                // Upload artifact on the S3 bucket for the DC/OS UI
                step([$class: 'S3BucketPublisher',
                    consoleLogLevel: 'INFO',
                    pluginFailureResultConstraint: 'FAILURE',
                    entries: [[
                        sourceFile: 'dist/*.tar.gz',
                        bucket: 'dcos-ui-builds',
                        selectedRegion: 'us-west-1',
                        noUploadOnFailure: true,
                        managedArtifacts: true,
                        flatten: true,
                        showDirectlyInBrowser: true,
                        keepForever: true
                    ]],
                    profileName: 'aws-production',
                    dontWaitForConcurrentBuildCompletion: false,
                ])
            }
            post {
                success {
                    archiveArtifacts 'dist/*.tar.gz'
                }
            }
        }

    }
}
