Homework 3: (Unity ID: tmainka) 
=========================
### Option 2

I have created two instances of Express server running on ports 3000 and 3001. I have implemented a proxy server running on port 3002 which redirects the request alternately to server 1 and 2. I have used [rpoplpush](http://redis.io/commands/rpoplpush) command of Redis to achieve the same. Using the 'rpoplpush' command with same source and destination key, one can use it as a circular list.

