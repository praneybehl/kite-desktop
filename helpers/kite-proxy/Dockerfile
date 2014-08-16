FROM ubuntu:14.04
MAINTAINER Kite contact@usekite.com

RUN mkdir /nginx

RUN echo "deb http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" > /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN echo "deb-src http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" >> /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C300EE8C
RUN apt-get update
RUN apt-get install -y  wget nginx

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

#fix for long server names
RUN sed -i 's/# server_names_hash_bucket/server_names_hash_bucket/g' /etc/nginx/nginx.conf

RUN mkdir /app
WORKDIR /app
ADD . /app

RUN wget https://github.com/jwilder/docker-gen/releases/download/0.3.2/docker-gen-linux-amd64-0.3.2.tar.gz
RUN tar xvzf docker-gen-linux-amd64-0.3.2.tar.gz

EXPOSE 80
ENV DOCKER_HOST unix:///tmp/docker.sock

CMD ["sh", "./start"]
