pipeline {
    agent {
        label 'infinity'
    }

    environment {
        CLUSTER_URL = 'http://icharalam-elasticl-atm3p900pucm-796070874.us-west-2.elb.amazonaws.com'
    }

    stages {

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
        stage('Unit Tests & Build') {
            steps {
                echo 'Building DC/OS UI...'
                sh '''docker run -i --rm \\
                  -v `pwd`:/dcos-ui \\
                  -e JENKINS_VERSION="yes" \\
                  mesosphere/dcos-ui:latest \\
                  npm run build
                '''
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

                // Run inside the container a shell script that is going to run
                // the HTTP server serving the `dist/` folder and then runs
                // cypress in the root directory
                sh '''cat <<EOF > integration-tests.sh
                http-server --proxy-secure=false -P $CLUSTER_URL -p 4200 dist&
                SERVER_PID=\\$!
                cypress run --reporter junit --reporter-options "mochaFile=cypress/results.xml"
                kill \\$SERVER_PID
                EOF
                docker run -i --rm --ipc=host \\
                  -v `pwd`:/dcos-ui \\
                  mesosphere/dcos-ui:latest \\
                  bash integration-tests.sh'''
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
                sh '''docker login -u "$DH_USERNAME" -p "$DH_PASSWORD"
                docker run -i --rm --ipc=host \\
                  -v `pwd`:/dcos-ui \\
                  mesosphere/dcos-ui:latest \\
                  dcos-system-test-driver -v ./.systemtest-dev.sh ${CLUSTER_URL}
                '''
            }
            post {
                always {
                    junit 'results/results.xml'
                }
            }
        }

        //
        // After we are done, we will puglish the resulting dist folder on S3
        //
        stage('Publish') {
            script {
                def gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
            }
            steps {
                echo 'Publishing to S3...'
                unstash 'dist'

                dir 'dist'
                sh 'tar -zcf dcos-${gitCommit}.tar.gz *'
            }
            post {
                success {
                    archiveArtifacts '*.tar.gz'
                }
            }
        }

    }
}
