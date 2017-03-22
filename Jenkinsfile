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
        stage('System Tests') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DH_PASSWORD', usernameVariable: 'DH_USERNAME')]) {
                    echo 'Running integration tests..'
                    sh '''docker login -u "$DH_USERNAME" -p "$DH_PASSWORD"
                    docker run -i --rm --ipc=host \\
                      -v `pwd`:/dcos-ui \\
                      mesosphere/dcos-ui:latest \\
                      dcos-system-test-driver -v ./.systemtest-dev.sh "http://icharalam-elasticl-atm3p900pucm-796070874.us-west-2.elb.amazonaws.com"
                    '''
                    junit 'results/results.xml'
                }
            }
        }
        stage('Publish') {
            steps {
                echo 'Publishing to S3...'
            }
        }
    }
}
