FROM node:0.10
MAINTAINER Kai Davenport <kaiyadavenport@gmail.com>
WORKDIR /usr/local/bin
RUN apt-get -y update
RUN apt-get -y install curl iptables
RUN curl -o /usr/local/bin/weave https://raw.githubusercontent.com/zettio/weave/master/weave && chmod +x weave
ADD . /srv/app
RUN chmod a+x /srv/app/run.sh
RUN cd /srv/app && npm install
EXPOSE 80
ENTRYPOINT ["/srv/app/run.sh"]