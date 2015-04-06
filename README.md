Homework 4: (Unity ID: tmainka) 
=========================
###Directory Structure:

	    |-- infrastructure
		|-- Queues
		|-- deploy
		   |-- blue.git
		   |-- blue-www
		   |-- green.git
		   |-- green-www


1. Here 'Queues' is the application which needs to be deployed. The application repository has been linked as a sub-module of current repository. 
2. 'deploy' contains the blue-green infrastructure.
3. 'infrastructure' contains the proxy for managing blue ad green servers.

**Blue server is running by default on port: 3001, with redis port: 6375**

**Green server is running by default on port: 3002, with redis port: 6379**

These configurations can be changed in file **"infrastructure.js"**.
Default traffic is routed to blue instance.
###Git Hooks:
"post-receive" hook provides a way to trigger deployment whenever code is pushed on green and blue repositories.

    #!/bin/sh
	GIT_WORK_TREE=../../deploy/blue-www/ git checkout -f
	cd ../../deploy/blue-www/
	npm install

###Switching and Mirroring:
Switching is handled in "infrastructure.js" by checking the incoming request url  and toggling the target between BLUE and GREEN servers.
 
If mirroring is off, switching would insert all the elements from current target redis queue to the new target. This is done using [LRANGE](http://redis.io/commands/lrange) and [LPOP](http://redis.io/commands/lpop) functions of redis.

Mirroring can be turned on/off by passing 1/0 parameter when running the infrastructure.js file.

    node infrastructure.js 1

where 1 implies Mirroring is ON.

When mirroring is ON, the post request coming on call to '/upload' forwards the request to both the target and auxiliary servers. This is achieved using `request.pipe` function.