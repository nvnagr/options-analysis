# E*TRADE API Node Sample Application

This sample Node application provides examples on using the ETRADE API endpoints.

## Requirements

In order to run this sample application you need the following items:

1. Install NodeJs v9 or later, e.g. running 'node -v', needs to be equal or above v9.x.x because the code is using ES6 syntax
 
2. An valid E*TRADE account so you can login to E*TRADE website, e.g. https://us.etrade.com/home

3. E*TRADE consumer key and consumer secret, either live or sandbox key

## Setup

1. Unzip node zip file

2. Edit the standard configuration file, e.g. config.ini, by adding the consumer key and consumer secret.

3. Install all the modules needed for NodeJS by running "npm install"  


## Run the code
./bin/EtradeNodeClient 
 (if using config.ini configuration file) 

or 

./bin/EtradeNodeClient config <your configuration file name>

or
./bin/EtradeNodeClient help
 (to see all the commands supported)

