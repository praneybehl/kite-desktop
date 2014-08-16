FROM ubuntu:14.04
MAINTAINER Kite <contact@usekite.com>

RUN apt-get update
RUN apt-get install -q -y dnsmasq

RUN echo 'listen-address=0.0.0.0' >> /etc/dnsmasq.conf
ADD start /

EXPOSE 53
CMD ["sh", "start"]
