@Library('sec_ci_libs@ic/dcos-ui-flavor') _

def master_branches = ["master", "ic/preview/jenkins-si", ] as String[]
def slackbot_token = '05dca2da-3e43-40fc-b5c0-504cc1783eee'
def slackbot_channel = '#frontend-dev'

pipeline {
    agent {
        label 'infinity'
    }

    stages {

        //
        // Do not accept triggers from unauthorised sources
        //
        stage('Verify Author') {
            steps {
                user_is_authorized(
                    master_branches,
                    slackbot_token,
                    slackbot_channel
                )
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
                    docker pull mesosphere/dcos-ui:latest
                    docker run -i --rm \\
                      --cap-add=SYS_ADMIN --security-opt apparmor:unconfined \\
                      -v `pwd`:/dcos-ui \\
                      -e JENKINS_VERSION="yes" \\
                      mesosphere/dcos-ui:latest \\
                      npm run scaffold'''
                }
            }
        }

        //
        // Run unit tests & build the project
        //
        stage('Lint, Unit Tests & Build') {
            steps {
                parallel lint: {
                    echo 'Running Lint...'
                    ansiColor('xterm') {
                        sh '''docker run -i --rm \\
                          --cap-add=SYS_ADMIN --security-opt apparmor:unconfined \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run lint
                        '''
                    }
                }, test: {
                    echo 'Running Unit Tests...'
                    ansiColor('xterm') {
                        sh '''docker run -i --rm \\
                          --cap-add=SYS_ADMIN --security-opt apparmor:unconfined \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run test
                        '''
                    }
                }, build: {
                    echo 'Building DC/OS UI...'
                    ansiColor('xterm') {
                        sh '''docker run -i --rm \\
                          --cap-add=SYS_ADMIN --security-opt apparmor:unconfined \\
                          -v `pwd`:/dcos-ui \\
                          -e JENKINS_VERSION="yes" \\
                          mesosphere/dcos-ui:latest \\
                          npm run build-assets
                        '''
                    }
                }, failFast: true
            }
            post {
                always {
                    junit 'jest/test-results/*.xml'
                }
                success {
                    stash includes: 'dist/*', name: 'dist'
                }
                failure {
                    archiveArtifacts 'npm-debug.log'
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
                    'cypress run --reporter junit --reporter-options "mochaFile=cypress/results.xml"',
                    'kill $SERVER_PID'
                ].join('\n')

                ansiColor('xterm') {
                    sh '''docker run -i --rm \\
                      --cap-add=SYS_ADMIN --security-opt apparmor:unconfined --ipc=host \\
                      -v `pwd`:/dcos-ui \\
                      mesosphere/dcos-ui:latest \\
                      bash integration-tests.sh'''
                }
            }
            post {
                always {
                    archiveArtifacts 'cypress/**/*'
                }
                success {
                    junit 'cypress/*.xml'
                }
            }
        }

        //
        // Run system integration tests
        //
        stage('System Tests') {
            steps {
                withCredentials(
                    [
                        string(
                            credentialsId: '8e2b2400-0f14-4e4d-b319-e1360f97627d',
                            variable: 'CCM_AUTH_TOKEN'
                        )
                    ]
                ) {
                    echo 'Running integration tests..'
                    unstash 'dist'

                    // Run the `dcos-system-test-driver` locally, that will use
                    // the .systemtest-dev.sh bootstrap config and provision a
                    // cluster for the test.
                    ansiColor('xterm') {
                        sh '''docker run -i --rm \\
                          --cap-add=SYS_ADMIN --security-opt apparmor:unconfined --ipc=host \\
                          -v `pwd`:/dcos-ui \\
                          -e CCM_AUTH_TOKEN=${CCM_AUTH_TOKEN} \\
                          mesosphere/dcos-ui:latest \\
                          dcos-system-test-driver -v ./.systemtest-dev.sh
                        '''
                    }
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
                    sh 'cd dist; tar -zcf dcos-open-$(git rev-parse --short HEAD).tar.gz *'
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
