pipeline {
    agent {
        label 'infinity'
    }

    stages {
        stage('Unit Tests & Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DH_PASSWORD', usernameVariable: 'DH_USERNAME')]) {
                    echo 'Setting-up environment...'
                    sh '''docker login -u "$DH_USERNAME" -p "$DH_PASSWORD"
                    docker run -i --rm \\
                      -v `pwd`:/dcos-ui \\
                      -e JENKINS_VERSION="yes" \\
                      mesosphere/dcos-ui:latest \\
                      npm run build
                    '''
                    junit 'jest/test-results/*.xml'
                }
            }
        }
        stage('Integration Tests') {
            steps {
                echo 'Running integration tests..'
            }
        }
        stage('System Tests') {
            steps {
                echo 'Running system tests..'
            }
        }
        stage('Publish') {
            steps {
                echo 'Publishing to S3...'
            }
        }
    }
}
